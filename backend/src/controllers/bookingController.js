import { Booking } from '../models/Booking.js';
import { Bus } from '../models/Bus.js';
import { Seat } from '../models/Seat.js';
import { Payment } from '../models/Payment.js';
import { Cancellation } from '../models/Cancellation.js';
import { createPendingBooking } from '../services/bookingService.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/customErrors.js';

export async function createBooking(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ValidationError('Authenticated user ID missing');
    }

    // OBTBS Trip-Centric Booking Flow
    if (req.body.tripId) {
      const pendingResult = await createPendingBooking({
        userId,
        tripId: req.body.tripId,
        boardingPoint: req.body.boardingPoint,
        droppingPoint: req.body.droppingPoint,
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
    } = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new NotFoundError(`Bus with ID ${busId} not found.`);
    }

    // Pre-flight check: Are any of these seats booked under confirmed bookings?
    const existingConflict = await Booking.findOne({
      busId,
      journeyDate,
      bookingStatus: 'confirmed',
      'passengers.seatNumber': { $in: seats },
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
        journeyDate,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        boardingPoint,
        droppingPoint,
        seats,
        passengers,
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

    // Create simulated payment record
    await Payment.create({
      bookingId: newBooking._id,
      userId,
      amount: totalFare,
      currency: 'INR',
      paymentMethod: paymentMethod?.includes('UPI') ? 'UPI' : 'Card',
      transactionReference: `TXN-${randomCode}-${Date.now().toString().slice(-4)}`,
      status: 'success',
    });

    // Mark seats as booked
    for (const seatNo of seats) {
      await Seat.findOneAndUpdate(
        { busId, journeyDate, seatNumber: seatNo },
        { status: 'booked', $unset: { heldUntil: '', heldBy: '' } },
        { upsert: true }
      );
    }

    // Decrement available seats in bus document
    await Bus.findByIdAndUpdate(busId, {
      $inc: { availableSeatsCount: -seats.length },
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: newBooking,
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
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingByReference(req, res, next) {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({
      $or: [{ bookingReference: reference.toUpperCase() }, { _id: reference }],
    });

    if (!booking) {
      throw new NotFoundError(`Booking with reference ${reference} not found.`);
    }

    res.status(200).json({
      success: true,
      data: booking,
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

    // Log cancellation
    await Cancellation.create({
      bookingId: booking._id,
      userId: booking.userId,
      bookingReference: booking.bookingReference,
      reason: reason || 'Customer requested self-cancellation',
      refundAmount: booking.totalFare,
      refundStatus: 'processed',
    });

    // Release seats
    await Seat.updateMany(
      { busId: booking.busId, journeyDate: booking.journeyDate, seatNumber: { $in: booking.seats } },
      { status: 'available' }
    );

    // Re-increment available seats in bus
    await Bus.findByIdAndUpdate(booking.busId, {
      $inc: { availableSeatsCount: booking.seats.length },
    });

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingReference} cancelled. Refund of ₹${booking.totalFare} initiated.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}
