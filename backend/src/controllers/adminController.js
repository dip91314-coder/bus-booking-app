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
import { NotFoundError, ValidationError } from '../utils/customErrors.js';

const idOf = (document) => document._id.toString();
const validId = (id) => mongoose.isValidObjectId(id);
const toObject = (document) => document.toObject({ virtuals: false });

function requireDocument(document, label) {
  if (!document) throw new NotFoundError(`${label} not found.`);
  return document;
}

function parseBusInput(input) {
  const { capacity, status, ...fields } = input;
  const updates = { ...fields };
  if (capacity !== undefined) updates.totalSeats = capacity;
  if (status !== undefined) {
    updates.isActive = status === 'Active';
    updates.operationalStatus = status;
  }
  return updates;
}

function formatBus(bus) {
  const value = toObject(bus);
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
    res.status(200).json({ success: true, count: buses.length, data: buses.map(formatBus) });
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
    res.status(200).json({ success: true, data: formatBus(requireDocument(bus, 'Bus')) });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminBus(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Bus not found.');
    const bus = await Bus.findByIdAndDelete(req.params.id);
    requireDocument(bus, 'Bus');
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
    busName: bus?.busName || '',
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

    await Promise.all([
      Cancellation.create({
        bookingId: booking._id,
        userId: booking.userId,
        bookingReference: booking.bookingReference,
        reason: req.body.reason || 'Administrative cancellation',
        refundAmount: booking.totalFare,
        refundStatus: 'processed',
      }),
      Seat.updateMany(
        { busId: booking.busId, journeyDate: booking.journeyDate, seatNumber: { $in: booking.seats } },
        { status: 'available', $unset: { heldUntil: '', heldBy: '' } }
      ),
      Payment.updateMany(
        { bookingId: booking._id },
        { status: 'refunded', refundStatus: 'Processed' }
      ),
      Bus.findByIdAndUpdate(booking.busId, { $inc: { availableSeatsCount: booking.seats.length } }),
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
    res.status(201).json({ success: true, data: { ...toObject(offer), id: idOf(offer) } });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminOffer(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Offer not found.');
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
        busName: review.busId?.busName || '',
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

    res.status(200).json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    next(error);
  }
}

export async function createAdminTrip(req, res, next) {
  try {
    const trip = await Trip.create(req.body);
    const populated = await Trip.findById(trip._id).populate('busId routeId');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminTrip(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Trip not found.');
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('busId routeId');
    requireDocument(trip, 'Trip');
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminTrip(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Trip not found.');
    const trip = await Trip.findByIdAndDelete(req.params.id);
    requireDocument(trip, 'Trip');
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
    res.status(200).json({ success: true, message: 'Pricing rule deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function updateBusSeatLayout(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new NotFoundError('Bus not found.');
    const { seatLayout, totalSeats } = req.body;
    const updates = {};
    if (seatLayout) updates.seatLayout = seatLayout;
    if (totalSeats) updates.totalSeats = totalSeats;

    const bus = await Bus.findByIdAndUpdate(req.params.id, updates, { new: true });
    requireDocument(bus, 'Bus');
    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
}
