import mongoose from 'mongoose';
import { Trip, Bus, SeatReservation, Booking, Pricing } from '../models/index.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/customErrors.js';

const MAX_SEATS_PER_BOOKING = 6;
const LOCK_DURATION_MS = (env.LOCK_MINUTES || 8) * 60 * 1000;

export function canUseTransactions() {
  const type = mongoose.connection?.client?.topology?.description?.type;
  return (
    type === 'ReplicaSetWithPrimary' ||
    type === 'Sharded' ||
    type === 'LoadBalanced'
  );
}

export async function getTripSeats(tripId) {
  const trip = await Trip.findById(tripId).populate('busId routeId');
  if (!trip) {
    throw new NotFoundError(`Trip with ID ${tripId} not found.`);
  }

  const bus = trip.busId;
  if (!bus) {
    throw new NotFoundError(`Associated bus for trip ${tripId} not found.`);
  }

  const now = new Date();

  // Find all active seat reservations for this trip
  const reservations = await SeatReservation.find({
    tripId: trip._id,
    $or: [{ status: 'booked' }, { status: 'locked', lockExpiresAt: { $gt: now } }],
  });

  const reservationMap = new Map();
  reservations.forEach((r) => {
    reservationMap.set(r.seatNumber, r);
  });

  // Calculate pricing for seater and sleeper
  const seaterPricing = await Pricing.resolvePrice({
    tripId: trip._id,
    routeId: trip.routeId?._id,
    busId: bus._id,
    seatType: 'seater',
  });

  const sleeperPricing = await Pricing.resolvePrice({
    tripId: trip._id,
    routeId: trip.routeId?._id,
    busId: bus._id,
    seatType: 'sleeper',
  });

  // Merge bus seatLayout with reservation state
  const layout = (bus.seatLayout || []).map((seat) => {
    const reservation = reservationMap.get(seat.seatNumber);
    let status = 'available';

    if (reservation) {
      if (reservation.status === 'booked') {
        status = 'booked';
      } else if (reservation.status === 'locked' && reservation.lockExpiresAt > now) {
        status = 'locked';
      }
    }

    const priceInfo = seat.type === 'sleeper' ? sleeperPricing : seaterPricing;

    return {
      seatNumber: seat.seatNumber,
      type: seat.type || 'seater',
      position: seat.position || 'lower',
      category: seat.category || 'normal',
      isLadies: Boolean(seat.isLadies),
      status,
      basePrice: priceInfo.basePrice,
      additionalCharges: priceInfo.additionalCharges,
      taxAmount: priceInfo.taxAmount,
      price: priceInfo.finalPrice,
    };
  });

  const availableCount = layout.filter((s) => s.status === 'available').length;
  const bookedCount = layout.filter((s) => s.status === 'booked').length;
  const lockedCount = layout.filter((s) => s.status === 'locked').length;

  return {
    tripId: trip._id,
    bus: {
      id: bus._id,
      name: bus.busName,
      number: bus.busNumber,
      type: bus.busType,
      deckType: bus.deckType,
      amenities: bus.amenities,
    },
    route: trip.routeId
      ? {
          id: trip.routeId._id,
          source: trip.routeId.source || trip.routeId.origin,
          destination: trip.routeId.destination,
          departurePoint: trip.routeId.departurePoint,
          arrivalPoint: trip.routeId.arrivalPoint,
          duration: trip.routeId.estimatedDuration,
        }
      : null,
    travelDate: trip.travelDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    totalSeats: bus.totalSeats || layout.length,
    availableSeats: availableCount,
    bookedSeatsCount: bookedCount,
    lockedSeatsCount: lockedCount,
    seats: layout,
  };
}

export async function lockSeats({ tripId, seatNumbers, userId }) {
  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new ValidationError('At least one seatNumber is required to lock seats.');
  }

  if (seatNumbers.length > MAX_SEATS_PER_BOOKING) {
    throw new ValidationError(`You can reserve a maximum of ${MAX_SEATS_PER_BOOKING} seats per booking.`);
  }

  // Deduplicate and uppercase
  const normalizedSeats = [...new Set(seatNumbers.map((s) => String(s).toUpperCase().trim()))];

  const trip = await Trip.findById(tripId).populate('busId');
  if (!trip) {
    throw new NotFoundError(`Trip with ID ${tripId} not found.`);
  }

  if (trip.status === 'cancelled' || trip.status === 'completed') {
    throw new ValidationError(`Cannot book seats on a trip that is ${trip.status}.`);
  }

  const bus = trip.busId;
  const validBusSeats = new Set((bus.seatLayout || []).map((s) => s.seatNumber));

  // Check if every requested seat exists in the physical layout
  const invalidSeats = normalizedSeats.filter((s) => !validBusSeats.has(s));
  if (invalidSeats.length > 0) {
    throw new ValidationError(`The following seats do not exist on this bus: ${invalidSeats.join(', ')}`);
  }

  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

  const useTransaction = canUseTransactions();
  const session = useTransaction ? await mongoose.startSession() : null;

  if (useTransaction && session) {
    session.startTransaction();
  }

  try {
    const opts = useTransaction && session ? { session } : {};

    // 1. Purge expired locks for the requested seats so they can be re-locked
    await SeatReservation.deleteMany(
      {
        tripId: trip._id,
        seatNumber: { $in: normalizedSeats },
        status: 'locked',
        lockExpiresAt: { $lte: now },
      },
      opts
    );

    // 2. Pre-check if any seat is already booked or actively locked by someone else
    const activeConflicts = await SeatReservation.find(
      {
        tripId: trip._id,
        seatNumber: { $in: normalizedSeats },
        $or: [
          { status: 'booked' },
          { status: 'locked', lockExpiresAt: { $gt: now }, userId: { $ne: userId } },
        ],
      },
      null,
      opts
    );

    if (activeConflicts.length > 0) {
      const conflictingSeatNumbers = activeConflicts.map((c) => c.seatNumber);
      throw new ConflictError(
        `The following seats are already locked or booked: ${conflictingSeatNumbers.join(', ')}`,
        { conflictingSeats: conflictingSeatNumbers }
      );
    }

    // 3. Atomically insert the locks for this user relying on the (tripId, seatNumber) unique compound index
    const recordsToInsert = normalizedSeats.map((seatNumber) => ({
      tripId: trip._id,
      busId: bus._id,
      travelDate: trip.travelDate,
      seatNumber,
      userId,
      status: 'locked',
      lockExpiresAt,
    }));

    let insertedReservations;
    try {
      insertedReservations = await SeatReservation.insertMany(recordsToInsert, {
        ordered: true,
        ...opts,
      });
    } catch (insertErr) {
      // If code 11000 (duplicate key error), roll back any partial locks from this batch
      if (!useTransaction) {
        await SeatReservation.deleteMany({
          tripId: trip._id,
          seatNumber: { $in: normalizedSeats },
          userId,
          status: 'locked',
        });
      }
      throw insertErr;
    }

    if (useTransaction) {
      await session.commitTransaction();
    }

    logger.info(
      { tripId: trip._id, userId, seats: normalizedSeats, lockExpiresAt },
      'Successfully locked seats for trip'
    );

    return {
      tripId: trip._id,
      seats: normalizedSeats,
      lockExpiresAt,
      lockDurationSeconds: Math.round(LOCK_DURATION_MS / 1000),
    };
  } catch (error) {
    if (useTransaction) {
      await session.abortTransaction();
    }

    // Catch MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      throw new ConflictError(
        'Concurrent collision: One or more selected seats were just locked by another customer. Please select different seats.',
        { conflictingSeats: normalizedSeats }
      );
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

export async function releaseLocks({ tripId, seatNumbers, userId }) {
  const query = {
    tripId,
    status: 'locked',
  };

  if (userId) {
    query.userId = userId;
  }

  if (seatNumbers && Array.isArray(seatNumbers) && seatNumbers.length > 0) {
    query.seatNumber = { $in: seatNumbers.map((s) => String(s).toUpperCase().trim()) };
  }

  const result = await SeatReservation.deleteMany(query);
  logger.info({ tripId, userId, deletedCount: result.deletedCount }, 'Released seat locks');
  return { releasedCount: result.deletedCount };
}

export async function cleanupExpiredLocks() {
  const now = new Date();
  try {
    // 1. Find expired locks
    const expiredLocks = await SeatReservation.find({
      status: 'locked',
      lockExpiresAt: { $lte: now },
    });

    if (expiredLocks.length > 0) {
      const expiredBookingIds = [
        ...new Set(expiredLocks.filter((l) => l.bookingId).map((l) => l.bookingId)),
      ];

      // Mark associated pending bookings as expired
      if (expiredBookingIds.length > 0) {
        await Booking.updateMany(
          { _id: { $in: expiredBookingIds }, bookingStatus: 'pending' },
          { $set: { bookingStatus: 'expired' } }
        );
      }

      // Delete the expired seat locks
      const deleteResult = await SeatReservation.deleteMany({
        status: 'locked',
        lockExpiresAt: { $lte: now },
      });

      logger.info(
        { purgedLocks: deleteResult.deletedCount, expiredBookings: expiredBookingIds.length },
        'Sweeper cleaned up expired seat locks'
      );
    }
  } catch (err) {
    logger.error({ err }, 'Error during expired locks cleanup');
  }
}
