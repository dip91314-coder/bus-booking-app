import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Bus } from '../models/Bus.js';
import { Seat } from '../models/Seat.js';
import { Payment } from '../models/Payment.js';
import { Cancellation } from '../models/Cancellation.js';
import { SeatReservation } from '../models/SeatReservation.js';
import { createPendingBooking } from '../services/bookingService.js';
import { NotFoundError, ConflictError, ValidationError, UnauthorizedError } from '../utils/customErrors.js';
import { normalizeYatraBus } from '../utils/yatraFleet.js';

export async function createBooking(req, res, next) {
  try {
    let userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError('Please sign in before booking a ticket.');
    }

    // OBTBS Trip-Centric Booking Flow
    if (req.body.tripId) {
      const pendingResult = await createPendingBooking({
        userId,
        tripId: req.body.tripId,
        boardingPoint: req.body.boardingPoint,
        droppingPoint: req.body.droppingPoint,
        from_location: req.body.from_location,
        to_location: req.body.to_location,
        pickup_point: req.body.pickup_point,
        drop_point: req.body.drop_point,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        passengers: req.body.passengers,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
      });

      return res.status(201).json({
        success: true,
        message: 'Pending booking created. Please complete payment to confirm reservation.',
        data: pendingResult,
      });
    }

    const {
      busId,
      journeyDate,
      boardingPoint,
      droppingPoint,
      seats,
      passengers,
      paymentMethod,
      contactEmail,
      contactPhone,
      from_location,
      to_location,
      pickup_point,
      drop_point,
      latitude,
      longitude,
    } = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new NotFoundError(`Bus with ID ${busId} not found.`);
    }

    // Pre-flight check: Are any of these seats booked under confirmed bookings?
    const normalizedSeats = [...new Set(seats.map((seat) => String(seat).toUpperCase().trim()))];
    if (normalizedSeats.length !== seats.length) {
      throw new ValidationError('Each seat can only be selected once.');
    }

    const now = new Date();
    const activeHolds = await Seat.find({
      busId,
      journeyDate,
      seatNumber: { $in: normalizedSeats },
      status: 'held',
      heldBy: userId,
      heldUntil: { $gt: now },
    }).select('seatNumber');
    const activeSeatNumbers = new Set(activeHolds.map((seat) => seat.seatNumber));
    const seatsWithoutHolds = normalizedSeats.filter((seat) => !activeSeatNumbers.has(seat));
    if (seatsWithoutHolds.length > 0) {
      throw new ConflictError(`Your seat hold has expired or is missing for: ${seatsWithoutHolds.join(', ')}.`);
    }

    const existingConflict = await Booking.findOne({
      busId,
      journeyDate,
      bookingStatus: 'confirmed',
      'passengers.seatNumber': { $in: normalizedSeats },
    });

    if (existingConflict) {
      throw new ConflictError('One or more selected seats have already been booked by another passenger.');
    }

    // Generate unique PNR
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pnr = `BK-${randomCode}`;

    const baseFare = bus.fare * seats.length;
    const tax = Math.round(baseFare * 0.05);
    const totalFare = baseFare + tax;

    let newBooking;
    try {
      newBooking = await Booking.create({
        bookingReference: pnr,
        userId,
        busId,
        busName: bus.busName,
        operator: bus.operator,
        busNumber: bus.busNumber,
        busType: bus.busType,
        origin: bus.origin,
        destination: bus.destination,
        from_location: from_location || bus.origin,
        to_location: to_location || bus.destination,
        pickup_point: pickup_point || boardingPoint,
        drop_point: drop_point || droppingPoint,
        latitude,
        longitude,
        journeyDate,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        boardingPoint,
        droppingPoint,
        seats: normalizedSeats,
        passengers: passengers.map((passenger) => ({
          ...passenger,
          seatNumber: String(passenger.seatNumber).toUpperCase().trim(),
        })),
        totalFare,
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: paymentMethod || 'Simulated Payment',
        contactEmail,
        contactPhone,
      });
    } catch (err) {
      // Intercept MongoDB compound unique index collision
      if (err.code === 11000) {
        throw new ConflictError(
          'Seat contention conflict: Another customer just confirmed one of your selected seats. Please re-select seats.'
        );
      }
      throw err;
    }

    let payment;
    try {
      payment = await Payment.create({
        bookingId: newBooking._id,
        userId,
        amount: totalFare,
        currency: 'INR',
        paymentMethod: paymentMethod?.includes('UPI') ? 'UPI' : 'Card',
        transactionReference: `TXN-${randomCode}-${Date.now().toString().slice(-4)}`,
        status: 'success',
      });

      const seatUpdate = await Seat.updateMany(
        {
          busId,
          journeyDate,
          seatNumber: { $in: normalizedSeats },
          status: 'held',
          heldBy: userId,
          heldUntil: { $gt: new Date() },
        },
        { $set: { status: 'booked' }, $unset: { heldUntil: '', heldBy: '' } }
      );
      if (seatUpdate.modifiedCount !== normalizedSeats.length) {
        throw new ConflictError('A seat hold expired during checkout. Please select your seats again.');
      }
    } catch (error) {
      if (payment) await Payment.deleteOne({ _id: payment._id });
      await Booking.deleteOne({ _id: newBooking._id });
      throw error;
    }

    // Decrement available seats in bus document
    await Bus.findByIdAndUpdate(busId, {
      $inc: { availableSeatsCount: -seats.length },
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: normalizeYatraBus(newBooking),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const userId = req.user?.userId;

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings.map(normalizeYatraBus),
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingByReference(req, res, next) {
  try {
    const { reference } = req.params;
    const query = { userId: req.user.userId };

    if (mongoose.isValidObjectId(reference)) {
      query.$or = [
        { bookingReference: reference.toUpperCase() },
        { _id: reference },
      ];
    } else {
      query.bookingReference = reference.toUpperCase();
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      throw new NotFoundError(`Booking with reference ${reference} not found.`);
    }

    res.status(200).json({
      success: true,
      data: normalizeYatraBus(booking),
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.userId;

    const booking = await Booking.findOne({
      $or: [{ _id: id }, { bookingReference: id.toUpperCase() }],
      userId,
    });

    if (!booking) {
      throw new NotFoundError(`Booking ${id} not found or unauthorized to cancel.`);
    }

    if (booking.bookingStatus === 'cancelled') {
      throw new ValidationError('This booking has already been cancelled.');
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    await Payment.updateMany(
      { bookingId: booking._id },
      { $set: { status: 'refunded', refundStatus: 'Processed' } }
    );

    // Log cancellation
    await Cancellation.create({
      bookingId: booking._id,
      userId: booking.userId,
      bookingReference: booking.bookingReference,
      reason: reason || 'Customer requested self-cancellation',
      refundAmount: booking.totalFare,
      refundStatus: 'processed',
    });

    if (booking.tripId) {
      await SeatReservation.deleteMany({
        tripId: booking.tripId,
        bookingId: booking._id,
        status: 'booked',
      });
    } else {
      await Seat.updateMany(
        {
          busId: booking.busId,
          journeyDate: booking.journeyDate,
          seatNumber: { $in: booking.seats },
          status: 'booked',
        },
        { $set: { status: 'available' }, $unset: { heldUntil: '', heldBy: '' } }
      );

      await Bus.findByIdAndUpdate(booking.busId, {
        $inc: { availableSeatsCount: booking.seats.length },
      });
    }

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingReference} cancelled. Refund of ₹${booking.totalFare} initiated.`,
      data: normalizeYatraBus(booking),
    });
  } catch (error) {
    next(error);
  }
}
