import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import {
  Bus,
  Route,
  Trip,
  Pricing,
  SeatReservation,
  Booking,
  Payment,
  Ticket,
  BusSchedule,
} from '../models/index.js';

export async function runMigration() {
  logger.info('🚀 Starting migration to Trip-Centric architecture...');

  try {
    await connectDB();

    // 1. Ensure Buses have seatLayout
    const buses = await Bus.find({});
    let busesUpdated = 0;
    for (const bus of buses) {
      if (!bus.seatLayout || bus.seatLayout.length === 0) {
        // Will trigger pre-save hook to generate layout
        bus.markModified('seatLayout');
        await bus.save();
        busesUpdated++;
      }
    }
    logger.info({ busesUpdated, totalBuses: buses.length }, 'Buses seatLayout checked/updated');

    // 2. Ensure Routes have boarding/dropping points and source
    const routes = await Route.find({});
    let routesUpdated = 0;
    for (const route of routes) {
      let modified = false;
      if (!route.source && route.origin) {
        route.source = route.origin;
        modified = true;
      }
      if (!route.boardingPoints || route.boardingPoints.length === 0) {
        route.boardingPoints = [
          { name: `${route.origin} Main Bus Terminal`, time: '21:00', landmark: 'Platform 1' },
          { name: `${route.origin} City Bypass Toll`, time: '21:30', landmark: 'Toll Plaza' },
        ];
        modified = true;
      }
      if (!route.droppingPoints || route.droppingPoints.length === 0) {
        route.droppingPoints = [
          { name: `${route.destination} Highway Junction`, time: '05:30', landmark: 'Near Ring Road' },
          { name: `${route.destination} Central Station`, time: '06:00', landmark: 'Gate 2' },
        ];
        modified = true;
      }
      if (modified) {
        await route.save();
        routesUpdated++;
      }
    }
    logger.info({ routesUpdated, totalRoutes: routes.length }, 'Routes updated with points & source');

    // 3. Migrate BusSchedules to Trips
    const schedules = await BusSchedule.find({});
    let tripsCreated = 0;
    const scheduleToTripMap = new Map();

    for (const schedule of schedules) {
      let routeId = schedule.routeId;
      const bus = await Bus.findById(schedule.busId);

      if (!routeId && bus) {
        let route = await Route.findOne({
          $or: [
            { origin: bus.origin, destination: bus.destination },
            { source: bus.origin, destination: bus.destination },
          ],
        });
        if (!route) {
          route = await Route.create({
            origin: bus.origin,
            source: bus.origin,
            destination: bus.destination,
            distanceKm: 350,
            estimatedDuration: bus.journeyDuration || '8h 00m',
            baseFare: schedule.fare || bus.fare || 750,
          });
        }
        routeId = route._id;
      }

      if (bus && routeId) {
        const trip = await Trip.findOneAndUpdate(
          {
            busId: schedule.busId,
            travelDate: schedule.journeyDate,
            departureTime: schedule.departureTime,
          },
          {
            $setOnInsert: {
              busId: schedule.busId,
              routeId,
              travelDate: schedule.journeyDate,
              departureTime: schedule.departureTime,
              arrivalTime: schedule.arrivalTime,
              status: schedule.status || 'scheduled',
              baseFare: schedule.fare || bus.fare,
              boardingPoints: bus.boardingPoints || [],
              droppingPoints: bus.droppingPoints || [],
            },
          },
          { upsert: true, new: true }
        );

        scheduleToTripMap.set(schedule._id.toString(), trip._id);
        tripsCreated++;
      }
    }
    logger.info({ tripsCreated, totalSchedules: schedules.length }, 'BusSchedules converted to Trips');

    // Also create Trips for upcoming dates for buses if no schedules existed
    const today = new Date().toISOString().split('T')[0];
    for (const bus of buses) {
      let route = await Route.findOne({
        $or: [
          { origin: bus.origin, destination: bus.destination },
          { source: bus.origin, destination: bus.destination },
        ],
      });
      if (route) {
        await Trip.findOneAndUpdate(
          {
            busId: bus._id,
            travelDate: today,
            departureTime: bus.departureTime || '21:00',
          },
          {
            $setOnInsert: {
              busId: bus._id,
              routeId: route._id,
              travelDate: today,
              departureTime: bus.departureTime || '21:00',
              arrivalTime: bus.arrivalTime || '06:00',
              status: 'scheduled',
              baseFare: bus.fare,
              boardingPoints: bus.boardingPoints || [],
              droppingPoints: bus.droppingPoints || [],
            },
          },
          { upsert: true }
        );
      }
    }

    // 4. Create baseline Pricing documents
    let pricingCreated = 0;
    for (const bus of buses) {
      const existing = await Pricing.findOne({ busId: bus._id, routeId: null, tripId: null });
      if (!existing && bus.fare) {
        await Pricing.create({
          busId: bus._id,
          seatType: 'all',
          basePrice: bus.fare,
          additionalCharges: 0,
          taxPercent: 5,
        });
        pricingCreated++;
      }
    }
    logger.info({ pricingCreated }, 'Baseline Pricing rules ensured');

    // 5. Migrate Bookings, SeatReservations, and Tickets
    const bookings = await Booking.find({});
    let bookingsMigrated = 0;
    let reservationsCreated = 0;
    let ticketsCreated = 0;

    for (const booking of bookings) {
      // Find or create trip for booking
      let trip = null;
      if (booking.tripId) {
        trip = await Trip.findById(booking.tripId);
      } else {
        trip = await Trip.findOne({
          busId: booking.busId,
          travelDate: booking.journeyDate,
        });

        if (!trip) {
          let route = await Route.findOne({
            $or: [
              { origin: booking.origin, destination: booking.destination },
              { source: booking.origin, destination: booking.destination },
            ],
          });
          if (!route) {
            route = await Route.create({
              origin: booking.origin,
              source: booking.origin,
              destination: booking.destination,
              distanceKm: 300,
              baseFare: booking.totalFare / Math.max(1, booking.seats?.length || 1),
            });
          }

          trip = await Trip.create({
            busId: booking.busId,
            routeId: route._id,
            travelDate: booking.journeyDate,
            departureTime: booking.departureTime || '21:00',
            arrivalTime: booking.arrivalTime || '06:00',
            status: 'scheduled',
            baseFare: booking.totalFare / Math.max(1, booking.seats?.length || 1),
          });
        }

        booking.tripId = trip._id;
        booking.pnr = booking.bookingReference;
        await booking.save();
        bookingsMigrated++;
      }

      // Create confirmed SeatReservations if booking is confirmed
      if (booking.bookingStatus === 'confirmed' && trip) {
        for (const seatNo of booking.seats || []) {
          try {
            await SeatReservation.findOneAndUpdate(
              { tripId: trip._id, seatNumber: seatNo },
              {
                $set: {
                  tripId: trip._id,
                  busId: booking.busId,
                  travelDate: booking.journeyDate,
                  seatNumber: seatNo,
                  bookingId: booking._id,
                  userId: booking.userId,
                  status: 'booked',
                  lockExpiresAt: null,
                },
              },
              { upsert: true }
            );
            reservationsCreated++;
          } catch (e) {
            logger.warn({ err: e.message, seatNo }, 'SeatReservation upsert note');
          }
        }

        // Generate Ticket if not existing
        const existingTicket = await Ticket.findOne({ bookingId: booking._id });
        if (!existingTicket) {
          await Ticket.create({
            bookingId: booking._id,
            pnr: booking.bookingReference,
            journeySnapshot: {
              busName: booking.busName,
              busNumber: booking.busNumber,
              busType: booking.busType,
              source: booking.origin,
              destination: booking.destination,
              travelDate: booking.journeyDate,
              departureTime: booking.departureTime,
              arrivalTime: booking.arrivalTime,
              boardingPoint: booking.boardingPoint,
              droppingPoint: booking.droppingPoint,
            },
            passengerSnapshot: (booking.passengers || []).map((p) => ({
              name: p.name,
              age: p.age,
              gender: p.gender,
              seatNumber: p.seatNumber,
              contact: booking.contactPhone,
              email: booking.contactEmail,
            })),
            seats: booking.seats,
            priceBreakdown: {
              basePrice: Math.round(booking.totalFare * 0.95),
              additionalCharges: 0,
              taxAmount: Math.round(booking.totalFare * 0.05),
              totalAmount: booking.totalFare,
            },
            paymentStatus: booking.paymentStatus === 'paid' ? 'Successful' : booking.paymentStatus,
          });
          ticketsCreated++;
        }
      }
    }

    logger.info(
      {
        bookingsMigrated,
        reservationsCreated,
        ticketsCreated,
      },
      'Bookings, SeatReservations, and Tickets migration completed'
    );

    logger.info('🎉 Trip-Centric Architecture Migration Finished Successfully');
  } catch (error) {
    logger.error({ error }, '❌ Migration failed');
    throw error;
  } finally {
    await disconnectDB();
  }
}

if (process.argv[1]?.endsWith('migrate-to-trips.js')) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
