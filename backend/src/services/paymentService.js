import mongoose from 'mongoose';
import { Booking, Payment, Ticket, SeatReservation } from '../models/index.js';
import { paymentGateway } from './paymentGateway.js';
import { canUseTransactions } from './seatLockService.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/customErrors.js';
import { logger } from '../config/logger.js';

export async function initiatePayment({ bookingId, userId }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with ID ${bookingId} not found.`);
  }

  if (String(booking.userId) !== String(userId)) {
    throw new ValidationError('You are not authorized to pay for this booking.');
  }

  if (booking.bookingStatus !== 'pending') {
    throw new ValidationError(`Cannot pay for a booking with status ${booking.bookingStatus}.`);
  }

  // Extend lock expiry by grace period (2 minutes) once to give customer time to finish checkout
  const gracePeriodMs = 2 * 60 * 1000;
  await SeatReservation.updateMany(
    { bookingId: booking._id, status: 'locked' },
    { $set: { lockExpiresAt: new Date(Date.now() + gracePeriodMs) } }
  );

  // Create order via gateway
  const order = await paymentGateway.createOrder({
    amount: booking.totalFare,
    currency: 'INR',
    receipt: `rcpt_${booking.pnr}`,
  });

  // Create or update pending Payment record
  const payment = await Payment.findOneAndUpdate(
    { bookingId: booking._id, status: 'pending' },
    {
      $set: {
        bookingId: booking._id,
        userId,
        amount: booking.totalFare,
        currency: 'INR',
        gateway: 'Mock',
        gatewayOrderId: order.id,
        transactionReference: `TXN-${booking.pnr}-${Date.now().toString().slice(-4)}`,
        status: 'pending',
      },
    },
    { upsert: true, new: true }
  );

  return {
    orderId: order.id,
    amount: booking.totalFare,
    currency: 'INR',
    pnr: booking.pnr,
    paymentId: payment._id,
    key: order.key,
  };
}

export async function confirmPayment({
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  rawPayload = null,
}) {
  logger.info({ gatewayOrderId, gatewayPaymentId }, 'Executing idempotent confirmPayment service');

  // 1. Idempotency Check: if this payment was already processed successfully, return existing result
  if (gatewayPaymentId) {
    const existingPayment = await Payment.findOne({ gatewayPaymentId });
    if (existingPayment && existingPayment.status === 'successful') {
      const existingTicket = await Ticket.findOne({ bookingId: existingPayment.bookingId });
      const existingBooking = await Booking.findById(existingPayment.bookingId);
      logger.info({ gatewayPaymentId }, 'Duplicate payment detected. Returning existing ticket idempotently.');
      return {
        success: true,
        isDuplicate: true,
        booking: existingBooking,
        ticket: existingTicket,
      };
    }
  }

  // 2. Find associated Payment record
  const payment = await Payment.findOne({
    $or: [{ gatewayOrderId }, { gatewayPaymentId }],
  });

  if (!payment) {
    throw new NotFoundError('Payment transaction record not found.');
  }

  const booking = await Booking.findById(payment.bookingId);
  if (!booking) {
    throw new NotFoundError('Booking record associated with payment not found.');
  }

  // 3. Signature verification (if signature provided)
  if (gatewaySignature) {
    const isValid = paymentGateway.verifyPaymentSignature({
      orderId: gatewayOrderId,
      paymentId: gatewayPaymentId,
      signature: gatewaySignature,
    });

    if (!isValid) {
      payment.status = 'failed';
      await payment.save();
      throw new ValidationError('Invalid payment signature. Transaction unverified.');
    }
  }

  // 4. Session / Transaction check to verify seat lock validity
  const useTransaction = canUseTransactions();
  const session = useTransaction ? await mongoose.startSession() : null;

  if (useTransaction && session) {
    session.startTransaction();
  }

  try {
    const opts = useTransaction && session ? { session } : {};

    // Verify all locks for this booking
    const locks = await SeatReservation.find(
      {
        tripId: booking.tripId,
        seatNumber: { $in: booking.seats },
      },
      null,
      opts
    );

    // CRITICAL SRS RULE: A successful payment is NEVER proof of seat availability.
    // Check if any seat was taken over by another user or expired & lost
    const takenOverSeats = locks.filter(
      (l) => l.status === 'booked' && String(l.bookingId) !== String(booking._id)
    );

    const lostLocks = booking.seats.filter(
      (seatNo) => !locks.some((l) => l.seatNumber === seatNo && String(l.bookingId) === String(booking._id))
    );

    if (takenOverSeats.length > 0 || lostLocks.length > 0) {
      // Seat was lost! Flag for refund!
      booking.bookingStatus = 'failed';
      await booking.save(opts);

      payment.status = 'failed';
      payment.refundStatus = 'refund_required';
      payment.gatewayPaymentId = gatewayPaymentId || payment.gatewayPaymentId;
      payment.rawWebhookPayload = rawPayload;
      await payment.save(opts);

      if (useTransaction) {
        await session.commitTransaction();
      }

      logger.warn(
        { bookingId: booking._id, seats: booking.seats },
        'Seat lock expired and was taken. Payment flagged for refund.'
      );

      return {
        success: false,
        refundFlagged: true,
        message: 'Your seat hold expired and the seats are no longer available. A refund has been flagged.',
        booking,
      };
    }

    // 5. Convert all temporary locks into confirmed booked seats
    await SeatReservation.updateMany(
      {
        tripId: booking.tripId,
        seatNumber: { $in: booking.seats },
        bookingId: booking._id,
      },
      {
        $set: {
          status: 'booked',
          lockExpiresAt: null,
        },
      },
      opts
    );

    // 6. Update Booking status to confirmed
    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save(opts);

    // 7. Update Payment status to successful
    payment.status = 'successful';
    payment.gatewayPaymentId = gatewayPaymentId || payment.gatewayPaymentId;
    payment.gatewaySignature = gatewaySignature || payment.gatewaySignature;
    payment.rawWebhookPayload = rawPayload;
    await payment.save(opts);

    // 8. Generate Ticket Snapshot
    const ticket = await Ticket.findOneAndUpdate(
      { bookingId: booking._id },
      {
        $set: {
          bookingId: booking._id,
          pnr: booking.pnr,
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
          passengerSnapshot: booking.passengers,
          seats: booking.seats,
          priceBreakdown: booking.priceBreakdown,
          paymentStatus: 'Successful',
        },
      },
      { upsert: true, new: true, ...opts }
    );

    if (useTransaction) {
      await session.commitTransaction();
    }

    logger.info({ bookingId: booking._id, pnr: booking.pnr, ticketId: ticket._id }, 'Payment confirmed & ticket issued');

    return {
      success: true,
      booking,
      ticket,
    };
  } catch (error) {
    if (useTransaction) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
