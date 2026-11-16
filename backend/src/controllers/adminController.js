import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Bus } from '../models/Bus.js';
import { BusSchedule } from '../models/BusSchedule.js';
import { Route } from '../models/Route.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { Cancellation } from '../models/Cancellation.js';
import { Seat } from '../models/Seat.js';
import { Review } from '../models/Review.js';
import { Driver } from '../models/Driver.js';
import { Staff } from '../models/Staff.js';
import { Offer } from '../models/Offer.js';
import { AdminNotification } from '../models/AdminNotification.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { Trip } from '../models/Trip.js';
import { Pricing } from '../models/Pricing.js';
import { SeatReservation } from '../models/SeatReservation.js';
import { Ticket } from '../models/Ticket.js';
import { AuditLog } from '../models/AuditLog.js';
import { TripNotification } from '../models/TripNotification.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import { normalizeYatraBus } from '../utils/yatraFleet.js';
import { invalidate } from '../config/redis.js';

const idOf = (document) => document._id.toString();
const validId = (id) => mongoose.isValidObjectId(id);
const toObject = (document) => document.toObject({ virtuals: false });

export async function recordAuditLog({ req, action, targetEntity, targetId = '', summary, diff = null }) {
  try {
    await AuditLog.create({
      adminId: req?.user?.userId || null,
      adminEmail: req?.user?.email || '',
      action,
      targetEntity,
      targetId: targetId ? targetId.toString() : '',
      summary,
      diff,
      ipAddress: req?.ip || req?.socket?.remoteAddress || '',
    });
  } catch {
    // Non-blocking
  }
}

function requireDocument(document, label) {
  if (!document) throw new NotFoundError(`${label} not found.`);
  return document;
}

function parseBusInput(input) {
  const { capacity, status, ...fields } = input;
  const updates = { ...fields };
  updates.operator = 'YatraBus';
  if (updates.busName !== undefined) {
    updates.busName = normalizeYatraBus(updates).busName;
  }
  if (capacity !== undefined) updates.totalSeats = capacity;
  if (status !== undefined) {
    updates.isActive = status === 'Active';
    updates.operationalStatus = status;
  }
  return updates;
}

function formatBus(bus) {
  const value = normalizeYatraBus(bus);
  return {
    ...value,
    id: idOf(bus),
    capacity: bus.totalSeats,
    status: bus.operationalStatus || (bus.isActive ? 'Active' : 'Inactive'),
  };
}

function parseRouteInput(input) {
  const { source, distance, duration, highway, stops, status, ...fields } = input;
  const updates = { ...fields };
  if (source !== undefined) updates.origin = source;
  if (distance !== undefined) updates.distanceKm = Number.parseFloat(distance);
  if (duration !== undefined) updates.estimatedDuration = duration;
  if (highway !== undefined) updates.highwayNumber = highway;
  if (stops !== undefined) updates.popularStops = stops;
  if (status !== undefined) updates.isActive = status === 'Active';
  return updates;
}

function formatRoute(route) {
  const value = toObject(route);
  return {
    ...value,
    id: idOf(route),
    source: route.origin,
    distance: `${route.distanceKm} km`,
    duration: route.estimatedDuration,
    highway: route.highwayNumber,
    stops: route.popularStops,
    status: route.isActive ? 'Active' : 'Inactive',
  };
}

function scheduleStatusToDatabase(status) {
  return {
    Scheduled: 'scheduled',
    'On Route': 'departed',
    Completed: 'completed',
    Cancelled: 'cancelled',
  }[status] || status;
}

function scheduleStatusToAdmin(status) {
  return {
    scheduled: 'Scheduled',
    departed: 'On Route',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }[status] || status;
}

function bookingStatusToAdmin(status) {
  return status ? status[0].toUpperCase() + status.slice(1) : status;
}

function paymentStatusToAdmin(status) {
  return status ? status[0].toUpperCase() + status.slice(1) : status;
}

function formatBooking(booking) {
  const value = toObject(booking);
  const passenger = booking.passengers?.[0];
  return {
    ...value,
    operator: 'YatraBus',
    busName: normalizeYatraBus(value).busName,
    id: idOf(booking),
    pnr: booking.bookingReference,
    passengerName: passenger?.name || 'Passenger',
    passengerEmail: booking.contactEmail,
    passengerPhone: booking.contactPhone,
    source: booking.origin,
    fare: booking.totalFare,
    tax: 0,
    totalAmount: booking.totalFare,
    bookingStatus: bookingStatusToAdmin(booking.bookingStatus),
    paymentStatus: paymentStatusToAdmin(booking.paymentStatus),
  };
}

export async function getDashboardMetrics(req, res, next) {
  try {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookingsCount,
      activeBuses,
      totalRegisteredBuses,
      totalRoutes,
      totalScheduledTrips,
      registeredUsers,
      recentBookings,
      revenueByRoute,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.find({ bookingStatus: 'confirmed' }).select('totalFare'),
      Booking.countDocuments({ bookingStatus: 'cancelled' }),
      Bus.countDocuments({ isActive: true }),
      Bus.countDocuments(),
      Route.countDocuments({ isActive: true }),
      Trip.countDocuments({ status: { $in: ['scheduled', 'active'] } }),
      User.countDocuments({ role: 'user' }),
      Booking.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email phone'),
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        {
          $group: {
            _id: { $concat: ['$origin', ' ➔ ', '$destination'] },
            totalRevenue: { $sum: '$totalFare' },
            bookingsCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalFare, 0);
    const capacity = await Bus.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalSeats: { $sum: '$totalSeats' }, availableSeats: { $sum: '$availableSeatsCount' } } },
    ]);
    const occupancy = capacity[0]?.totalSeats
      ? Math.round(((capacity[0].totalSeats - capacity[0].availableSeats) / capacity[0].totalSeats) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        totalRevenueNumber: totalRevenue,
        activeBuses,
        totalRegisteredBuses,
        totalRoutes,
        totalScheduledTrips,
        totalConfirmedTickets: confirmedBookings.length,
        totalCancelledBookings: cancelledBookingsCount,
        totalRegisteredCustomers: registeredUsers,
        registeredUsers,
        occupancyRate: `${occupancy}%`,
        recentBookings: recentBookings.map(formatBooking),
        recentBookingActivities: recentBookings.map(formatBooking),
        revenueByRoute: revenueByRoute.map((route) => ({
          route: route._id,
          revenue: route.totalRevenue,
          bookings: route.bookingsCount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
}

export async function getAllBookings(req, res, next) {
  try {
    const { date, status, paymentStatus } = req.query;
    const filter = {};
    if (date) filter.journeyDate = String(date);
    if (status) filter.bookingStatus = String(status).toLowerCase();
    if (paymentStatus) filter.paymentStatus = String(paymentStatus).toLowerCase();

    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email phone');
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings.map(formatBooking),
    });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req, res, next) {
  try {
    const now = new Date();
    const timeframeDays = { '7D': 7, '30D': 30, '90D': 90 };
    const timeframe = String(req.query.timeframe || '30D').toUpperCase();
    const rangeStart = timeframe === 'YTD'
      ? new Date(now.getFullYear(), 0, 1)
      : new Date(now.getTime() - ((timeframeDays[timeframe] || 30) - 1) * 24 * 60 * 60 * 1000);
    const [bookings, cancellations, buses, users, previousUsers] = await Promise.all([
      Booking.find({ createdAt: { $gte: rangeStart, $lte: now } })
        .select('createdAt totalFare bookingStatus origin destination busType'),
      Cancellation.find({ cancellationDate: { $gte: rangeStart, $lte: now } })
        .select('reason cancellationDate'),
      Bus.find().select('busType'),
      User.find({ role: 'user', createdAt: { $gte: rangeStart, $lte: now } }).select('createdAt status'),
      User.countDocuments({ role: 'user', createdAt: { $lt: rangeStart }, status: { $ne: 'Suspended' } }),
    ]);

    const monthStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const monthly = new Map();
    for (let cursor = monthStart; cursor <= now; cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      monthly.set(key, {
        month: cursor.toLocaleString('en', { month: 'short' }),
        revenue: 0,
        bookings: 0,
        newRegistrations: 0,
        activeRegistrations: 0,
      });
    }

    const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    for (const booking of bookings) {
      const data = monthly.get(monthKey(booking.createdAt));
      if (!data) continue;
      data.bookings += 1;
      if (booking.bookingStatus === 'confirmed') data.revenue += booking.totalFare;
    }
    for (const user of users) {
      const data = monthly.get(monthKey(user.createdAt));
      if (data) {
        data.newRegistrations += 1;
        if (user.status !== 'Suspended') data.activeRegistrations += 1;
      }
    }

    let activePassengers = previousUsers;
    const passengerGrowth = [];
    for (const [key, data] of monthly) {
      activePassengers += data.activeRegistrations;
      const [year, month] = key.split('-').map(Number);
      passengerGrowth.push({
        month: data.month,
        activePassengers,
        newRegistrations: data.newRegistrations,
        endDate: new Date(year, month, 0, 23, 59, 59, 999),
      });
    }

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + (booking.bookingStatus === 'confirmed' ? booking.totalFare : 0),
      0
    );
    const confirmed = bookings.filter((booking) => booking.bookingStatus === 'confirmed').length;
    const cancelled = bookings.filter((booking) => booking.bookingStatus === 'cancelled').length;
    const previousPassengerCount = passengerGrowth.length > 1
      ? passengerGrowth[passengerGrowth.length - 2].activePassengers
      : previousUsers;
    const currentPassengerCount = passengerGrowth[passengerGrowth.length - 1]?.activePassengers || previousUsers;
    const passengerGrowthRate = previousPassengerCount
      ? `${currentPassengerCount >= previousPassengerCount ? '+' : ''}${Math.round(
          ((currentPassengerCount - previousPassengerCount) / previousPassengerCount) * 100
        )}%`
      : '0%';
    const busTypes = new Map();
    for (const bus of buses) {
      busTypes.set(bus.busType, (busTypes.get(bus.busType) || 0) + 1);
    }
    const cancellationCounts = new Map();
    for (const cancellation of cancellations) {
      const reason = cancellation.reason || 'Unspecified';
      cancellationCounts.set(reason, (cancellationCounts.get(reason) || 0) + 1);
    }
    const totalCancellationRecords = cancellations.length;
    const corridorCounts = new Map();
    for (const booking of bookings) {
      const corridor = `${booking.origin} - ${booking.destination}`;
      const current = corridorCounts.get(corridor) || { trips: 0, revenue: 0 };
      current.trips += 1;
      if (booking.bookingStatus === 'confirmed') current.revenue += booking.totalFare;
      corridorCounts.set(corridor, current);
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBookings: bookings.length,
          confirmed,
          cancelled,
          totalRevenue,
          completionRate: bookings.length > 0 ? `${Math.round((confirmed / bookings.length) * 100)}%` : '0%',
          cancellationRate: bookings.length > 0 ? `${Math.round((cancelled / bookings.length) * 100)}%` : '0%',
          passengerGrowthRate,
        },
        revenueMonthly: [...monthly.values()].map(({ month, revenue, bookings: bookingCount }) => ({
          month,
          revenue,
          bookings: bookingCount,
        })),
        busTypeStats: [...busTypes.entries()]
          .map(([type, count]) => ({
            type,
            count,
            percentage: buses.length ? Math.round((count / buses.length) * 100) : 0,
          }))
          .sort((left, right) => right.count - left.count),
        passengerGrowth: passengerGrowth.map(({ month, activePassengers, newRegistrations }) => ({
          month,
          activePassengers,
          newRegistrations,
        })),
        cancellationReasons: [...cancellationCounts.entries()]
          .map(([reason, count]) => ({
            reason,
            count,
            percentage: totalCancellationRecords ? Math.round((count / totalCancellationRecords) * 100) : 0,
          }))
          .sort((left, right) => right.count - left.count),
        highwayCorridors: [...corridorCounts.entries()]
          .map(([corridor, value]) => ({ corridor, ...value }))
          .sort((left, right) => right.trips - left.trips)
          .slice(0, 10),
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminBuses(req, res, next) {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    const busIds = buses.map((b) => b._id);

    const [trips, pricings] = await Promise.all([
      Trip.find({ busId: { $in: busIds } }).populate('routeId').select('busId routeId baseFare'),
      Pricing.find({ busId: { $in: busIds } }).select('busId basePrice'),
    ]);

    const busRoutesMap = new Map();
    const tripFareMap = new Map();
    for (const trip of trips) {
      const bId = trip.busId?.toString();
      if (!bId) continue;
      if (!busRoutesMap.has(bId)) busRoutesMap.set(bId, new Set());
      if (trip.routeId) {
        const origin = trip.routeId.origin || trip.routeId.source;
        const dest = trip.routeId.destination;
        if (origin && dest) {
          busRoutesMap.get(bId).add(`${origin} ➔ ${dest}`);
        }
      }
      if (trip.baseFare && !tripFareMap.has(bId)) {
        tripFareMap.set(bId, trip.baseFare);
      }
    }

    const pricingMap = new Map();
    for (const p of pricings) {
      if (p.busId && !pricingMap.has(p.busId.toString())) {
        pricingMap.set(p.busId.toString(), p.basePrice);
      }
    }

    const formattedBuses = buses.map((bus) => {
      const base = formatBus(bus);
      const bId = bus._id.toString();
      const assigned = busRoutesMap.has(bId) ? Array.from(busRoutesMap.get(bId)) : [];
      if (assigned.length === 0 && bus.origin && bus.destination) {
        assigned.push(`${bus.origin} ➔ ${bus.destination}`);
      }
      const baseFare = pricingMap.get(bId) || tripFareMap.get(bId) || bus.fare;
      return {
        ...base,
        assignedRoutes: assigned,
        fare: baseFare,
        baseFare,
      };
    });

    res.status(200).json({ success: true, count: formattedBuses.length, data: formattedBuses });
  } catch (error) {
    next(error);
  }
}

export async function createAdminBus(req, res, next) {
  try {
    const bus = await Bus.create({
      ...parseBusInput(req.body),
      availableSeatsCount: req.body.capacity,
    });
    await invalidate('bus:');
    await invalidate('trips:');
    res.status(201).json({ success: true, data: formatBus(bus) });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminBus(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Bus not found.');
    const currentBus = await Bus.findById(req.params.id);
    requireDocument(currentBus, 'Bus');
    const updates = parseBusInput(req.body);
    if (req.body.capacity !== undefined) {
      const occupiedSeats = currentBus.totalSeats - currentBus.availableSeatsCount;
      if (req.body.capacity < occupiedSeats) {
        throw new ValidationError('Bus capacity cannot be less than its occupied seat count.');
      }
      updates.availableSeatsCount = req.body.capacity - occupiedSeats;
    }

    const bus = await Bus.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    await invalidate('bus:');
    await invalidate('trips:');
    res.status(200).json({ success: true, data: formatBus(requireDocument(bus, 'Bus')) });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminBus(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Bus not found.');

    const today = new Date().toISOString().slice(0, 10);
    const futureBookingsCount = await Booking.countDocuments({
      busId: req.params.id,
      journeyDate: { $gte: today },
      bookingStatus: 'confirmed',
    });
    if (futureBookingsCount > 0) {
      throw new ValidationError(`Cannot delete bus: ${futureBookingsCount} future trips scheduled with existing bookings.`);
    }

    const bus = await Bus.findByIdAndDelete(req.params.id);
    requireDocument(bus, 'Bus');
    await invalidate('bus:');
    await invalidate('trips:');

    await recordAuditLog({
      req,
      action: 'DELETE_BUS',
      targetEntity: 'Bus',
      targetId: req.params.id,
      summary: `Deleted bus ${bus.busNumber} (${bus.busName})`,
    });

    res.status(200).json({ success: true, message: 'Bus removed successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminRoutes(req, res, next) {
  try {
    const routes = await Route.find().sort({ origin: 1, destination: 1 });
    res.status(200).json({ success: true, count: routes.length, data: routes.map(formatRoute) });
  } catch (error) {
    next(error);
  }
}

export async function createAdminRoute(req, res, next) {
  try {
    const route = await Route.create(parseRouteInput(req.body));
    await invalidate('routes:');
    await invalidate('trips:');
    res.status(201).json({ success: true, data: formatRoute(route) });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminRoute(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Route not found.');
    const route = await Route.findByIdAndUpdate(req.params.id, parseRouteInput(req.body), {
      new: true,
      runValidators: true,
    });
    await invalidate('routes:');
    await invalidate('trips:');
    res.status(200).json({ success: true, data: formatRoute(requireDocument(route, 'Route')) });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminRoute(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Route not found.');
    const route = await Route.findByIdAndDelete(req.params.id);
    requireDocument(route, 'Route');
    await invalidate('routes:');
    await invalidate('trips:');
    res.status(200).json({ success: true, message: 'Route removed successfully.' });
  } catch (error) {
    next(error);
  }
}

function parseScheduleInput(input) {
  const { status, ...fields } = input;
  return { ...fields, status: status ? scheduleStatusToDatabase(status) : undefined };
}

function formatSchedule(schedule) {
  const value = toObject(schedule);
  const bus = schedule.busId && typeof schedule.busId === 'object' ? schedule.busId : null;
  const route = schedule.routeId && typeof schedule.routeId === 'object' ? schedule.routeId : null;
  return {
    ...value,
    id: idOf(schedule),
    busId: bus ? idOf(bus) : String(schedule.busId),
    busNumber: bus?.busNumber || '',
    busName: bus ? normalizeYatraBus(bus).busName : '',
    routeId: route ? idOf(route) : String(schedule.routeId || ''),
    source: route?.origin || '',
    destination: route?.destination || '',
    status: scheduleStatusToAdmin(schedule.status),
  };
}

export async function getAdminSchedules(req, res, next) {
  try {
    const schedules = await BusSchedule.find()
      .sort({ journeyDate: 1 })
      .populate('busId', 'busNumber busName')
      .populate('routeId', 'origin destination');
    res.status(200).json({ success: true, count: schedules.length, data: schedules.map(formatSchedule) });
  } catch (error) {
    next(error);
  }
}

async function validateScheduleReferences(busId, routeId) {
  const [bus, route] = await Promise.all([
    busId ? Bus.findById(busId).select('_id') : null,
    routeId ? Route.findById(routeId).select('_id') : null,
  ]);
  if (busId && !bus) throw new NotFoundError('Schedule bus not found.');
  if (routeId && !route) throw new NotFoundError('Schedule route not found.');
}

export async function createAdminSchedule(req, res, next) {
  try {
    await validateScheduleReferences(req.body.busId, req.body.routeId);
    const schedule = await BusSchedule.create(parseScheduleInput(req.body));
    await schedule.populate([
      { path: 'busId', select: 'busNumber busName' },
      { path: 'routeId', select: 'origin destination' },
    ]);
    await invalidate('trips:');
    res.status(201).json({ success: true, data: formatSchedule(schedule) });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminSchedule(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Schedule not found.');
    if (req.body.busId || req.body.routeId) {
      const current = await BusSchedule.findById(req.params.id);
      requireDocument(current, 'Schedule');
      await validateScheduleReferences(req.body.busId || current.busId, req.body.routeId || current.routeId);
    }

    const schedule = await BusSchedule.findByIdAndUpdate(req.params.id, parseScheduleInput(req.body), {
      new: true,
      runValidators: true,
    })
      .populate('busId', 'busNumber busName')
      .populate('routeId', 'origin destination');
    await invalidate('trips:');
    res.status(200).json({ success: true, data: formatSchedule(requireDocument(schedule, 'Schedule')) });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminSchedule(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Schedule not found.');
    const schedule = await BusSchedule.findByIdAndDelete(req.params.id);
    requireDocument(schedule, 'Schedule');
    await invalidate('trips:');
    res.status(200).json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function cancelAdminBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne(
      validId(id) ? { $or: [{ _id: id }, { bookingReference: id.toUpperCase() }] } : { bookingReference: id.toUpperCase() }
    );
    requireDocument(booking, 'Booking');
    if (booking.bookingStatus === 'cancelled') {
      throw new ValidationError('This booking has already been cancelled.');
    }
    if (booking.bookingStatus !== 'confirmed') {
      throw new ValidationError('Only confirmed bookings can be cancelled by an administrator.');
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    const seatRelease = booking.tripId
      ? SeatReservation.deleteMany({
          tripId: booking.tripId,
          bookingId: booking._id,
          status: 'booked',
        })
      : Promise.all([
          Seat.updateMany(
            {
              busId: booking.busId,
              journeyDate: booking.journeyDate,
              seatNumber: { $in: booking.seats },
              status: 'booked',
            },
            { $set: { status: 'available' }, $unset: { heldUntil: '', heldBy: '' } }
          ),
          Bus.findByIdAndUpdate(booking.busId, { $inc: { availableSeatsCount: booking.seats.length } }),
        ]);

    await Promise.all([
      Cancellation.create({
        bookingId: booking._id,
        userId: booking.userId,
        bookingReference: booking.bookingReference,
        reason: req.body.reason || 'Administrative cancellation',
        refundAmount: booking.totalFare,
        refundStatus: 'processed',
      }),
      seatRelease,
      Payment.updateMany(
        { bookingId: booking._id },
        { status: 'refunded', refundStatus: 'Processed' }
      ),
    ]);

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingReference} cancelled and refund processed.`,
      data: formatBooking(booking),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminPassengers(req, res, next) {
  try {
    const [users, bookingTotals] = await Promise.all([
      User.find({ role: 'user' }).sort({ createdAt: -1 }),
      Booking.aggregate([
        { $group: { _id: '$userId', totalBookings: { $sum: 1 }, totalSpent: { $sum: '$totalFare' } } },
      ]),
    ]);
    const totalsByUser = new Map(bookingTotals.map((item) => [String(item._id), item]));

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map((user) => {
        const totals = totalsByUser.get(idOf(user));
        return {
          id: idOf(user),
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city || '',
          totalBookings: totals?.totalBookings || 0,
          totalSpent: totals?.totalSpent || 0,
          walletBalance: user.walletBalance || 0,
          status: user.status || 'Active',
          joinedDate: user.createdAt,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminPassenger(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Passenger not found.');
    const updates = { ...req.body };
    if (updates.phone) {
      const digits = updates.phone.replace(/\D/g, '');
      updates.phone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    }
    const passenger = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'user' },
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ success: true, data: requireDocument(passenger, 'Passenger') });
  } catch (error) {
    next(error);
  }
}

export async function toggleAdminPassengerStatus(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Passenger not found.');
    const passenger = await User.findOne({ _id: req.params.id, role: 'user' });
    requireDocument(passenger, 'Passenger');
    passenger.status = passenger.status === 'Suspended' ? 'Active' : 'Suspended';
    await passenger.save();
    res.status(200).json({ success: true, data: { id: idOf(passenger), status: passenger.status } });
  } catch (error) {
    next(error);
  }
}

export async function getAdminDrivers(req, res, next) {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 }).populate('busId', 'busNumber busName');
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers.map((driver) => ({
        ...toObject(driver),
        id: idOf(driver),
        assignedBus: driver.busId ? `${driver.busId.busNumber} (${driver.busId.busName})` : '',
        busId: driver.busId ? idOf(driver.busId) : '',
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminDriver(req, res, next) {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: { ...toObject(driver), id: idOf(driver), busId: driver.busId?.toString() || '' } });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminDriver(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Driver not found.');
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    requireDocument(driver, 'Driver');
    await driver.populate('busId', 'busNumber busName');
    res.status(200).json({
      success: true,
      data: {
        ...toObject(driver),
        id: idOf(driver),
        assignedBus: driver.busId ? `${driver.busId.busNumber} (${driver.busId.busName})` : '',
        busId: driver.busId ? idOf(driver.busId) : '',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminDriver(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Driver not found.');
    const driver = await Driver.findByIdAndDelete(req.params.id);
    requireDocument(driver, 'Driver');
    res.status(200).json({ success: true, message: 'Driver removed successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminStaff(req, res, next) {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: staff.length, data: staff.map((member) => ({ ...toObject(member), id: idOf(member) })) });
  } catch (error) {
    next(error);
  }
}

export async function createAdminStaff(req, res, next) {
  try {
    const member = await Staff.create(req.body);
    res.status(201).json({ success: true, data: { ...toObject(member), id: idOf(member) } });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminStaff(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Staff member not found.');
    const member = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: { ...toObject(requireDocument(member, 'Staff member')), id: idOf(member) } });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminStaff(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Staff member not found.');
    const member = await Staff.findByIdAndDelete(req.params.id);
    requireDocument(member, 'Staff member');
    res.status(200).json({ success: true, message: 'Staff member removed successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminPayments(req, res, next) {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('bookingId', 'bookingReference')
      .populate('userId', 'name');
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments.map((payment) => ({
        ...toObject(payment),
        id: payment.transactionReference,
        bookingId: payment.bookingId?.bookingReference || payment.bookingId?.toString() || '',
        passengerName: payment.userId?.name || 'Passenger',
        providerReference: payment.transactionReference,
        paymentMethod: ({
          UPI: 'UPI',
          Card: 'Credit Card',
          NetBanking: 'Net Banking',
          Wallet: 'Wallet',
        })[payment.paymentMethod] || payment.paymentMethod,
        status: payment.status === 'success' ? 'Success' : payment.status[0].toUpperCase() + payment.status.slice(1),
        refundStatus: payment.refundStatus || 'None',
        date: payment.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function processAdminRefund(req, res, next) {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne(
      validId(id) ? { $or: [{ _id: id }, { transactionReference: id }] } : { transactionReference: id }
    );
    requireDocument(payment, 'Payment');
    if (payment.status === 'refunded') throw new ValidationError('This payment has already been refunded.');
    if (payment.status !== 'success') throw new ValidationError('Only successful payments can be refunded.');
    payment.status = 'refunded';
    payment.refundStatus = 'Processed';
    await payment.save();
    await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'refunded' });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully.',
      data: { id: payment.transactionReference, status: 'Refunded', refundStatus: payment.refundStatus },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOffers(req, res, next) {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: offers.length, data: offers.map((offer) => ({ ...toObject(offer), id: idOf(offer) })) });
  } catch (error) {
    next(error);
  }
}

export async function createAdminOffer(req, res, next) {
  try {
    const offer = await Offer.create(req.body);
    await invalidate('offers:');
    res.status(201).json({ success: true, data: { ...toObject(offer), id: idOf(offer) } });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminOffer(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Offer not found.');
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await invalidate('offers:');
    res.status(200).json({ success: true, data: { ...toObject(requireDocument(offer, 'Offer')), id: idOf(offer) } });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminOffer(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Offer not found.');
    const offer = await Offer.findByIdAndDelete(req.params.id);
    requireDocument(offer, 'Offer');
    await invalidate('offers:');
    res.status(200).json({ success: true, message: 'Offer deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .populate('busId', 'busName origin destination');
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews.map((review) => ({
        ...toObject(review),
        id: idOf(review),
        passengerName: review.userId?.name || review.userName,
        busName: review.busId ? normalizeYatraBus(review.busId).busName : '',
        route: review.busId ? `${review.busId.origin} ➔ ${review.busId.destination}` : '',
        date: review.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminReviewStatus(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Review not found.');
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: { ...toObject(requireDocument(review, 'Review')), id: idOf(review) } });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminReview(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Review not found.');
    const review = await Review.findByIdAndDelete(req.params.id);
    requireDocument(review, 'Review');
    res.status(200).json({ success: true, message: 'Review removed successfully.' });
  } catch (error) {
    next(error);
  }
}

function formatNotification(notification) {
  return {
    ...toObject(notification),
    id: idOf(notification),
    time: notification.createdAt.toLocaleString(),
  };
}

export async function getAdminNotifications(req, res, next) {
  try {
    const notifications = await AdminNotification.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      data: notifications.map(formatNotification),
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminNotification(req, res, next) {
  try {
    const notification = await AdminNotification.create(req.body);
    res.status(201).json({ success: true, data: formatNotification(notification) });
  } catch (error) {
    next(error);
  }
}

export async function markAdminNotificationRead(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Notification not found.');
    const notification = await AdminNotification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.status(200).json({ success: true, data: formatNotification(requireDocument(notification, 'Notification')) });
  } catch (error) {
    next(error);
  }
}

export async function markAllAdminNotificationsRead(req, res, next) {
  try {
    await AdminNotification.updateMany({ read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminNotification(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Notification not found.');
    const notification = await AdminNotification.findByIdAndDelete(req.params.id);
    requireDocument(notification, 'Notification');
    res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSettings(req, res, next) {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' });
    res.status(200).json({ success: true, data: settings?.values || {} });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminSettings(req, res, next) {
  try {
    let settings = await PlatformSettings.findOne({ key: 'platform' });
    if (!settings) {
      settings = new PlatformSettings({ key: 'platform', values: req.body });
    } else {
      settings.values = { ...settings.values, ...req.body };
      settings.markModified('values');
    }
    await settings.save();
    res.status(200).json({ success: true, data: settings.values });
  } catch (error) {
    next(error);
  }
}

export async function changeAdminPassword(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('+password');
    requireDocument(user, 'Administrator');
    if (!(await user.comparePassword(req.body.currentPassword))) {
      throw new ValidationError('Current password is incorrect.');
    }

    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminTrips(req, res, next) {
  try {
    const { busId, routeId, date, status } = req.query;
    const filter = {};
    if (busId && validId(busId)) filter.busId = busId;
    if (routeId && validId(routeId)) filter.routeId = routeId;
    if (date) filter.travelDate = date;
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('busId', 'busName busNumber busType totalSeats deckType')
      .populate('routeId', 'origin destination source departurePoint arrivalPoint')
      .sort({ travelDate: -1, departureTime: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips.map((trip) => ({
        ...trip.toObject(),
        busId: normalizeYatraBus(trip.busId),
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminTrip(req, res, next) {
  try {
    const trip = await Trip.create(req.body);
    const populated = await Trip.findById(trip._id).populate('busId routeId');
    await invalidate('trips:');
    res.status(201).json({
      success: true,
      data: { ...populated.toObject(), busId: normalizeYatraBus(populated.busId) },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminTrip(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Trip not found.');
    const previousTrip = await Trip.findById(req.params.id);
    requireDocument(previousTrip, 'Trip');

    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('busId routeId');
    requireDocument(trip, 'Trip');
    await invalidate('trips:');

    const isCancelled = req.body.status === 'cancelled' && previousTrip.status !== 'cancelled';
    const isDelayed = (req.body.status === 'delayed' && previousTrip.status !== 'delayed') ||
      (req.body.departureTime && req.body.departureTime !== previousTrip.departureTime);

    if (isCancelled || isDelayed) {
      const bookings = await Booking.find({ tripId: trip._id, bookingStatus: 'confirmed' });
      const notifPromises = bookings.map((b) =>
        TripNotification.create({
          tripId: trip._id,
          bookingId: b._id,
          userId: b.userId,
          type: isCancelled ? 'CANCELLATION' : 'DELAY',
          title: isCancelled
            ? `Trip Cancelled: ${b.origin} to ${b.destination}`
            : `Trip Delayed / Rescheduled: ${b.origin} to ${b.destination}`,
          message: isCancelled
            ? `Your scheduled journey on ${trip.travelDate} (PNR: ${b.pnr}) has been cancelled by operator.`
            : `Your journey on ${trip.travelDate} has been rescheduled to depart at ${trip.departureTime}.`,
          isRead: false,
        })
      );
      await Promise.all(notifPromises).catch(() => {});
    }

    await recordAuditLog({
      req,
      action: 'UPDATE_TRIP',
      targetEntity: 'Trip',
      targetId: trip._id.toString(),
      summary: `Updated trip ${trip._id} status to ${trip.status}`,
      diff: req.body,
    });

    res.status(200).json({
      success: true,
      data: { ...trip.toObject(), busId: normalizeYatraBus(trip.busId) },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminTrip(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Trip not found.');
    const trip = await Trip.findByIdAndDelete(req.params.id);
    requireDocument(trip, 'Trip');
    await invalidate('trips:');
    res.status(200).json({ success: true, message: 'Trip deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminPricing(req, res, next) {
  try {
    const { busId, routeId, tripId } = req.query;
    const filter = {};
    if (busId && validId(busId)) filter.busId = busId;
    if (routeId && validId(routeId)) filter.routeId = routeId;
    if (tripId && validId(tripId)) filter.tripId = tripId;

    const rules = await Pricing.find(filter)
      .populate('busId', 'busName busNumber')
      .populate('routeId', 'origin destination')
      .populate('tripId', 'travelDate departureTime');

    res.status(200).json({ success: true, count: rules.length, data: rules });
  } catch (error) {
    next(error);
  }
}

export async function createAdminPricing(req, res, next) {
  try {
    const pricing = await Pricing.create(req.body);
    await invalidate('trips:');
    res.status(201).json({ success: true, data: pricing });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminPricing(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Pricing rule not found.');
    const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    requireDocument(pricing, 'Pricing rule');
    await invalidate('trips:');
    res.status(200).json({ success: true, data: pricing });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminPricing(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Pricing rule not found.');
    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    requireDocument(pricing, 'Pricing rule');
    await invalidate('trips:');
    res.status(200).json({ success: true, message: 'Pricing rule deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function updateBusSeatLayout(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Bus not found.');
    const bus = await Bus.findById(req.params.id);
    requireDocument(bus, 'Bus');

    const today = new Date().toISOString().slice(0, 10);
    const futureBookingsCount = await Booking.countDocuments({
      busId: req.params.id,
      journeyDate: { $gte: today },
      bookingStatus: 'confirmed',
    });
    if (futureBookingsCount > 0) {
      throw new ValidationError(`Cannot modify layout: ${futureBookingsCount} future trips scheduled with existing bookings.`);
    }

    const { seatLayout, totalSeats } = req.body;
    const capacity = totalSeats !== undefined ? Number(totalSeats) : bus.totalSeats;
    if (seatLayout && Array.isArray(seatLayout)) {
      if (seatLayout.length !== capacity) {
        throw new ValidationError(`Layout seat count (${seatLayout.length}) must match total seat capacity (${capacity}).`);
      }
    }

    const updates = {};
    if (seatLayout) updates.seatLayout = seatLayout;
    if (totalSeats) updates.totalSeats = capacity;

    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, updates, { new: true });
    requireDocument(updatedBus, 'Bus');
    await invalidate('bus:');
    await invalidate('trips:');

    await recordAuditLog({
      req,
      action: 'UPDATE_BUS_LAYOUT',
      targetEntity: 'Bus',
      targetId: req.params.id,
      summary: `Updated seat layout and capacity (${capacity} seats) for bus ${bus.busNumber}`,
      diff: updates,
    });

    res.status(200).json({ success: true, data: normalizeYatraBus(updatedBus) });
  } catch (error) {
    next(error);
  }
}

export async function generateRecurringTrips(req, res, next) {
  try {
    const { routeId, busId, departureTime, arrivalTime, recurrence, startDate, endDate, specificDates, baseFare } = req.body;
    if (!validId(routeId)) throw new ValidationError('Valid routeId is required.');
    if (!validId(busId)) throw new ValidationError('Valid busId is required.');
    if (!departureTime || !arrivalTime) throw new ValidationError('departureTime and arrivalTime are required.');

    const [route, bus] = await Promise.all([
      Route.findById(routeId),
      Bus.findById(busId),
    ]);
    requireDocument(route, 'Route');
    requireDocument(bus, 'Bus');

    const datesToGenerate = [];
    if (recurrence === 'specific_dates' && Array.isArray(specificDates)) {
      datesToGenerate.push(...specificDates);
    } else if (startDate && endDate) {
      let current = new Date(startDate);
      const end = new Date(endDate);
      while (current <= end) {
        const dayOfWeek = current.getDay(); // 0 is Sun, 6 is Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isWeekday = !isWeekend;
        if (
          recurrence === 'daily' ||
          (recurrence === 'weekdays' && isWeekday) ||
          (recurrence === 'weekends' && isWeekend)
        ) {
          datesToGenerate.push(current.toISOString().slice(0, 10));
        }
        current.setDate(current.getDate() + 1);
      }
    } else {
      throw new ValidationError('Valid date range or specific dates must be provided.');
    }

    if (datesToGenerate.length === 0) {
      throw new ValidationError('No valid dates match the specified recurrence criteria.');
    }

    const createdTrips = [];
    const conflicts = [];

    for (const travelDate of datesToGenerate) {
      // Check bus conflict: Same bus cannot depart twice at the exact same travelDate and departureTime
      const existing = await Trip.findOne({ busId, travelDate, departureTime });
      if (existing) {
        conflicts.push({ travelDate, departureTime, busNumber: bus.busNumber });
        continue;
      }

      const trip = await Trip.create({
        busId,
        routeId,
        travelDate,
        departureTime,
        arrivalTime,
        baseFare: baseFare || bus.fare || 500,
        status: 'scheduled',
        boardingPoints: route.boardingPoints || [],
        droppingPoints: route.droppingPoints || [],
      });
      createdTrips.push(trip);
    }

    await invalidate('trips:');

    await recordAuditLog({
      req,
      action: 'GENERATE_RECURRING_TRIPS',
      targetEntity: 'Trip',
      targetId: busId,
      summary: `Generated ${createdTrips.length} recurring trips for bus ${bus.busNumber} on route ${route.origin} - ${route.destination} (${conflicts.length} conflicts skipped)`,
      diff: { recurrence, datesCount: datesToGenerate.length, createdCount: createdTrips.length, conflictsCount: conflicts.length },
    });

    res.status(201).json({
      success: true,
      message: `Generated ${createdTrips.length} trips successfully.${conflicts.length > 0 ? ` ${conflicts.length} trips skipped due to scheduling conflicts.` : ''}`,
      count: createdTrips.length,
      conflicts,
      data: createdTrips,
    });
  } catch (error) {
    next(error);
  }
}

export async function previewPricing(req, res, next) {
  try {
    const { routeId, busId, date, seatType = 'seater', position = 'lower', row = 1 } = req.body;
    let basePrice = 500;
    let pricingRule = null;

    if (routeId && validId(routeId)) {
      pricingRule = await Pricing.findOne({
        routeId,
        isActive: true,
        $or: [{ seatType }, { seatType: 'all' }],
      }).sort({ seatType: seatType === 'all' ? 1 : -1 });
    }

    if (!pricingRule && busId && validId(busId)) {
      pricingRule = await Pricing.findOne({
        busId,
        isActive: true,
        $or: [{ seatType }, { seatType: 'all' }],
      });
    }

    if (pricingRule) {
      basePrice = pricingRule.basePrice;
    } else if (busId && validId(busId)) {
      const bus = await Bus.findById(busId);
      if (bus?.fare) basePrice = bus.fare;
    }

    const appliedMultipliers = {};
    let multiplierTotal = 1.0;

    if (date) {
      const d = new Date(date);
      const day = d.getDay();
      if (day === 0 || day === 5 || day === 6) {
        const weekendMult = pricingRule?.weekendMultiplier || 1.2;
        appliedMultipliers.weekend = weekendMult;
        multiplierTotal *= weekendMult;
      }
    }

    if (seatType === 'sleeper') {
      const sleeperMult = pricingRule?.sleeperMultiplier || 1.2;
      appliedMultipliers.sleeper = sleeperMult;
      multiplierTotal *= sleeperMult;
    }

    if (position === 'lower') {
      const lowerMult = pricingRule?.lowerBerthMultiplier || 1.1;
      appliedMultipliers.lowerBerth = lowerMult;
      multiplierTotal *= lowerMult;
    }

    if (Number(row) === 1) {
      const frontMult = pricingRule?.frontRowMultiplier || 1.05;
      appliedMultipliers.frontRow = frontMult;
      multiplierTotal *= frontMult;
    }

    const subtotal = Math.round(basePrice * multiplierTotal);
    const taxPercent = pricingRule?.taxPercent || 5;
    const taxAmount = Math.round(subtotal * (taxPercent / 100));
    const finalFare = subtotal + taxAmount;

    res.status(200).json({
      success: true,
      data: {
        basePrice,
        multiplierTotal: Number(multiplierTotal.toFixed(2)),
        appliedMultipliers,
        subtotal,
        taxPercent,
        taxAmount,
        finalFare,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function adjustAdminPassengerWallet(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    if (!validId(id)) throw new NotFoundError('Passenger not found.');
    if (typeof amount !== 'number') throw new ValidationError('Valid numeric amount is required.');

    const user = await User.findById(id);
    requireDocument(user, 'User');
    user.walletBalance = Math.max(0, (user.walletBalance || 0) + amount);
    await user.save();

    await recordAuditLog({
      req,
      action: 'ADJUST_WALLET',
      targetEntity: 'User',
      targetId: user._id.toString(),
      summary: `Adjusted wallet by ₹${amount} for ${user.email} (Reason: ${reason || 'Admin adjustment'})`,
      diff: { amount, reason, newBalance: user.walletBalance },
    });

    res.status(200).json({
      success: true,
      message: `Wallet updated. New balance: ₹${user.walletBalance}`,
      data: { id: user._id, walletBalance: user.walletBalance },
    });
  } catch (error) {
    next(error);
  }
}

export async function changeAdminBookingSeat(req, res, next) {
  try {
    const { id } = req.params;
    const { oldSeatNumber, newSeatNumber } = req.body;
    if (!oldSeatNumber || !newSeatNumber) throw new ValidationError('Both oldSeatNumber and newSeatNumber are required.');

    const booking = await Booking.findOne(
      validId(id) ? { $or: [{ _id: id }, { bookingReference: id.toUpperCase() }] } : { bookingReference: id.toUpperCase() }
    );
    requireDocument(booking, 'Booking');

    if (booking.bookingStatus !== 'confirmed') {
      throw new ValidationError('Only confirmed bookings can have seats reassigned.');
    }

    if (!booking.seats.includes(oldSeatNumber)) {
      throw new ValidationError(`Seat ${oldSeatNumber} is not part of this booking.`);
    }

    if (booking.tripId) {
      const occupied = await SeatReservation.findOne({
        tripId: booking.tripId,
        seatNumber: newSeatNumber.toUpperCase(),
        status: { $in: ['locked', 'booked'] },
      });
      if (occupied) {
        throw new ValidationError(`Seat ${newSeatNumber} is already reserved or booked on this trip.`);
      }

      await SeatReservation.findOneAndUpdate(
        { tripId: booking.tripId, seatNumber: oldSeatNumber.toUpperCase() },
        { seatNumber: newSeatNumber.toUpperCase() }
      );
    }

    booking.seats = booking.seats.map((s) => (s === oldSeatNumber ? newSeatNumber.toUpperCase() : s));
    booking.passengers = booking.passengers.map((p) => {
      if (p.seatNumber === oldSeatNumber) {
        p.seatNumber = newSeatNumber.toUpperCase();
      }
      return p;
    });

    await booking.save();

    await recordAuditLog({
      req,
      action: 'CHANGE_BOOKING_SEAT',
      targetEntity: 'Booking',
      targetId: booking._id.toString(),
      summary: `Changed seat from ${oldSeatNumber} to ${newSeatNumber} for PNR ${booking.pnr || booking.bookingReference}`,
      diff: { oldSeatNumber, newSeatNumber },
    });

    res.status(200).json({
      success: true,
      message: `Seat changed successfully to ${newSeatNumber.toUpperCase()}.`,
      data: formatBooking(booking),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminAuditLogs(req, res, next) {
  try {
    const { action, targetEntity, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (targetEntity) filter.targetEntity = targetEntity;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
}
