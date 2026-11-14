import crypto from 'crypto';
import { Trip, Bus, Route, Booking, SeatReservation, Pricing } from '../models/index.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/customErrors.js';
import { logger } from '../config/logger.js';

export async function createPendingBooking({
  userId,
  tripId,
  boardingPoint,
  droppingPoint,
  passengers,
  contactEmail,
  contactPhone,
}) {
  if (!tripId) {
    throw new ValidationError('tripId is required to create a booking.');
  }

  if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
    throw new ValidationError('At least one passenger is required.');
  }

  const trip = await Trip.findById(tripId).populate('busId routeId');
  if (!trip) {
    throw new NotFoundError(`Trip with ID ${tripId} not found.`);
  }

  const bus = trip.busId;
  const route = trip.routeId;
  const now = new Date();

  const requestedSeats = passengers.map((p) => String(p.seatNumber).toUpperCase().trim());
  const seatLayoutMap = new Map((bus.seatLayout || []).map((s) => [s.seatNumber, s]));

  // 1. Verify caller has active, valid locks for EVERY requested seat
  const activeLocks = await SeatReservation.find({
    tripId: trip._id,
    seatNumber: { $in: requestedSeats },
    status: 'locked',
    lockExpiresAt: { $gt: now },
    userId,
  });

  if (activeLocks.length !== requestedSeats.length) {
    const lockedSeatsFound = new Set(activeLocks.map((l) => l.seatNumber));
    const missingLocks = requestedSeats.filter((s) => !lockedSeatsFound.has(s));
    throw new ConflictError(
      `Your lock for seats [${missingLocks.join(', ')}] has expired or is invalid. Please select seats again.`,
      { expiredSeats: missingLocks }
    );
  }

  // 2. Recompute price strictly on the backend using the Pricing model
  let totalBasePrice = 0;
  let totalAdditional = 0;
  let totalTax = 0;

  for (const seatNo of requestedSeats) {
    const layoutItem = seatLayoutMap.get(seatNo);
    const seatType = layoutItem?.type === 'sleeper' ? 'sleeper' : 'seater';

    const priceDetails = await Pricing.resolvePrice({
      tripId: trip._id,
      routeId: route?._id,
      busId: bus._id,
      seatType,
    });

    totalBasePrice += priceDetails.basePrice;
    totalAdditional += priceDetails.additionalCharges;
    totalTax += priceDetails.taxAmount;
  }

  const finalTotalAmount = totalBasePrice + totalAdditional + totalTax;

  // 3. Generate Crypto-Random Unique PNR
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  const pnr = `OBT-${randomSuffix}`;

  // 4. Create Pending Booking document
  const booking = await Booking.create({
    bookingReference: pnr,
    pnr,
    userId,
    tripId: trip._id,
    busId: bus._id,
    busName: bus.busName,
    operator: bus.operator,
    busNumber: bus.busNumber,
    busType: bus.busType,
    origin: route?.source || route?.origin || bus.origin,
    destination: route?.destination || bus.destination,
    journeyDate: trip.travelDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    boardingPoint: boardingPoint || trip.boardingPoints?.[0]?.name || bus.boardingPoints?.[0]?.name || 'Main Stand',
    droppingPoint: droppingPoint || trip.droppingPoints?.[0]?.name || bus.droppingPoints?.[0]?.name || 'City Junction',
    seats: requestedSeats,
    passengers: passengers.map((p) => ({
      name: p.name.trim(),
      age: Number(p.age),
      gender: p.gender.toLowerCase(),
      seatNumber: String(p.seatNumber).toUpperCase().trim(),
      contact: p.contact || contactPhone || '',
      email: p.email || contactEmail || '',
    })),
    priceBreakdown: {
      basePrice: totalBasePrice,
      additionalCharges: totalAdditional,
      taxAmount: totalTax,
      totalAmount: finalTotalAmount,
    },
    totalFare: finalTotalAmount,
    bookingStatus: 'pending',
    paymentStatus: 'pending',
    contactEmail,
    contactPhone,
  });

  // 5. Associate the created bookingId with the active locks
  await SeatReservation.updateMany(
    { tripId: trip._id, seatNumber: { $in: requestedSeats }, userId },
    { $set: { bookingId: booking._id } }
  );

  logger.info({ bookingId: booking._id, pnr, totalFare: finalTotalAmount }, 'Created pending booking');

  return {
    bookingId: booking._id,
    pnr: booking.pnr,
    seats: requestedSeats,
    priceBreakdown: booking.priceBreakdown,
    totalFare: booking.totalFare,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    travelDate: booking.journeyDate,
    departureTime: booking.departureTime,
  };
}
