import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  User,
  Bus,
  Route,
  Trip,
  Pricing,
  SeatReservation,
  Booking,
  Payment,
  Ticket,
} from './models/index.js';
import { getTripSeats, lockSeats, releaseLocks } from './services/seatLockService.js';
import { createPendingBooking } from './services/bookingService.js';
import { initiatePayment, confirmPayment } from './services/paymentService.js';
import { paymentGateway } from './services/paymentGateway.js';

describe('OBTBS Concurrency, Seat Locking, & Payment Engine', () => {
  let mongo;
  let userA, userB;
  let testBus, testRoute, testTrip;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Trip.syncIndexes();
    await SeatReservation.syncIndexes();
    await Payment.syncIndexes();
    await Booking.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      Trip.deleteMany({}),
      Pricing.deleteMany({}),
      SeatReservation.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Ticket.deleteMany({}),
    ]);

    userA = await User.create({
      name: 'Customer A',
      email: 'customera@test.com',
      password: 'password123',
      phone: '9000000001',
    });

    userB = await User.create({
      name: 'Customer B',
      email: 'customerb@test.com',
      password: 'password123',
      phone: '9000000002',
    });

    testBus = await Bus.create({
      busNumber: 'WB-01-1234',
      busName: 'Digha Express',
      operator: 'Bengal Travels',
      origin: 'Kolkata',
      destination: 'Digha',
      departureTime: '06:00',
      arrivalTime: '10:30',
      fare: 500,
      totalSeats: 36,
      deckType: 'single',
    });

    testRoute = await Route.create({
      origin: 'Kolkata',
      destination: 'Digha',
      distanceKm: 180,
    });

    testTrip = await Trip.create({
      busId: testBus._id,
      routeId: testRoute._id,
      travelDate: '2026-11-20',
      departureTime: '06:00',
      arrivalTime: '10:30',
      baseFare: 500,
    });
  });

  it('Two concurrent lock requests for the exact same seat: exactly one succeeds', async () => {
    // Both users try to lock seat 'S1' concurrently
    const results = await Promise.allSettled([
      lockSeats({ tripId: testTrip._id, seatNumbers: ['S1'], userId: userA._id }),
      lockSeats({ tripId: testTrip._id, seatNumbers: ['S1'], userId: userB._id }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason.statusCode).toBe(409);
  });

  it('Same seat on different trips / dates is allowed independently', async () => {
    const tripNov21 = await Trip.create({
      busId: testBus._id,
      routeId: testRoute._id,
      travelDate: '2026-11-21',
      departureTime: '06:00',
      arrivalTime: '10:30',
      baseFare: 500,
    });

    const lockTrip1 = await lockSeats({
      tripId: testTrip._id,
      seatNumbers: ['S1'],
      userId: userA._id,
    });
    expect(lockTrip1.seats).toContain('S1');

    // Same bus, same seat, but different travel date/trip -> MUST succeed!
    const lockTrip2 = await lockSeats({
      tripId: tripNov21._id,
      seatNumbers: ['S1'],
      userId: userB._id,
    });
    expect(lockTrip2.seats).toContain('S1');
  });

  it('Expired seat lock is treated as available and can be re-locked by another user', async () => {
    // Create an expired lock for userA
    await SeatReservation.create({
      tripId: testTrip._id,
      busId: testBus._id,
      travelDate: testTrip.travelDate,
      seatNumber: 'S2',
      userId: userA._id,
      status: 'locked',
      lockExpiresAt: new Date(Date.now() - 10000), // 10s in the past
    });

    // Check seat availability API: expired seat must appear available
    const seatMap = await getTripSeats(testTrip._id);
    const seatS2 = seatMap.seats.find((s) => s.seatNumber === 'S2');
    expect(seatS2.status).toBe('available');

    // User B now locks the previously expired seat S2 -> Must succeed!
    const newLock = await lockSeats({
      tripId: testTrip._id,
      seatNumbers: ['S2'],
      userId: userB._id,
    });
    expect(newLock.seats).toContain('S2');
  });

  it('End-to-End verified payment confirms booking, marks seats booked, and creates ticket', async () => {
    // 1. Lock seats
    await lockSeats({
      tripId: testTrip._id,
      seatNumbers: ['S3', 'S4'],
      userId: userA._id,
    });

    // 2. Create pending booking
    const bookingRes = await createPendingBooking({
      userId: userA._id,
      tripId: testTrip._id,
      boardingPoint: 'Kolkata Bus Depot',
      droppingPoint: 'Digha Beach Stand',
      passengers: [
        { name: 'John Doe', age: 30, gender: 'male', seatNumber: 'S3' },
        { name: 'Jane Doe', age: 28, gender: 'female', seatNumber: 'S4' },
      ],
      contactEmail: 'john@example.com',
      contactPhone: '9876543210',
    });

    expect(bookingRes.bookingStatus).toBe('pending');
    expect(bookingRes.pnr).toBeDefined();

    // 3. Initiate payment
    const initRes = await initiatePayment({
      bookingId: bookingRes.bookingId,
      userId: userA._id,
    });

    expect(initRes.orderId).toBeDefined();

    // 4. Generate valid gateway signature
    const mockPaymentId = `pay_${Date.now()}`;
    const signature = paymentGateway.generateSignature(initRes.orderId, mockPaymentId);

    // 5. Confirm payment
    const confirmRes = await confirmPayment({
      gatewayOrderId: initRes.orderId,
      gatewayPaymentId: mockPaymentId,
      gatewaySignature: signature,
    });

    expect(confirmRes.success).toBe(true);
    expect(confirmRes.booking.bookingStatus).toBe('confirmed');
    expect(confirmRes.ticket.pnr).toBe(bookingRes.pnr);

    // Verify seats are permanently booked
    const reservations = await SeatReservation.find({
      tripId: testTrip._id,
      seatNumber: { $in: ['S3', 'S4'] },
    });
    expect(reservations.every((r) => r.status === 'booked')).toBe(true);
  });

  it('Invalid payment signature fails transaction without confirming booking', async () => {
    await lockSeats({
      tripId: testTrip._id,
      seatNumbers: ['S5'],
      userId: userA._id,
    });

    const bookingRes = await createPendingBooking({
      userId: userA._id,
      tripId: testTrip._id,
      passengers: [{ name: 'Test User', age: 25, gender: 'male', seatNumber: 'S5' }],
      contactEmail: 'test@example.com',
      contactPhone: '9876543210',
    });

    const initRes = await initiatePayment({
      bookingId: bookingRes.bookingId,
      userId: userA._id,
    });

    // Send invalid fake signature
    await expect(
      confirmPayment({
        gatewayOrderId: initRes.orderId,
        gatewayPaymentId: 'pay_invalid_123',
        gatewaySignature: 'bad_signature_hex_value',
      })
    ).rejects.toThrow();

    const booking = await Booking.findById(bookingRes.bookingId);
    expect(booking.bookingStatus).toBe('pending');
  });

  it('Idempotent confirmation: duplicate webhook callback returns existing ticket without duplicating records', async () => {
    await lockSeats({
      tripId: testTrip._id,
      seatNumbers: ['S6'],
      userId: userA._id,
    });

    const bookingRes = await createPendingBooking({
      userId: userA._id,
      tripId: testTrip._id,
      passengers: [{ name: 'Idempotency User', age: 35, gender: 'female', seatNumber: 'S6' }],
      contactEmail: 'idem@test.com',
      contactPhone: '9876543210',
    });

    const initRes = await initiatePayment({
      bookingId: bookingRes.bookingId,
      userId: userA._id,
    });

    const mockPaymentId = `pay_idem_${Date.now()}`;
    const signature = paymentGateway.generateSignature(initRes.orderId, mockPaymentId);

    // First payment callback
    const firstCall = await confirmPayment({
      gatewayOrderId: initRes.orderId,
      gatewayPaymentId: mockPaymentId,
      gatewaySignature: signature,
    });
    expect(firstCall.success).toBe(true);

    // Second duplicate payment callback (e.g. webhook retry)
    const secondCall = await confirmPayment({
      gatewayOrderId: initRes.orderId,
      gatewayPaymentId: mockPaymentId,
      gatewaySignature: signature,
    });

    expect(secondCall.success).toBe(true);
    expect(secondCall.isDuplicate).toBe(true);

    // Verify exactly ONE ticket and ONE payment exist
    const tickets = await Ticket.find({ bookingId: bookingRes.bookingId });
    expect(tickets.length).toBe(1);
  });

  it('Flags refund (refund_required) if lock expired and seat was taken before payment arrived', async () => {
    await lockSeats({
      tripId: testTrip._id,
      seatNumbers: ['S7'],
      userId: userA._id,
    });

    const bookingRes = await createPendingBooking({
      userId: userA._id,
      tripId: testTrip._id,
      passengers: [{ name: 'Late Payer', age: 40, gender: 'male', seatNumber: 'S7' }],
      contactEmail: 'late@test.com',
      contactPhone: '9876543210',
    });

    const initRes = await initiatePayment({
      bookingId: bookingRes.bookingId,
      userId: userA._id,
    });

    // Simulating: lock expired, and userB booked seat S7 in the meantime!
    await SeatReservation.deleteMany({ tripId: testTrip._id, seatNumber: 'S7' });
    await SeatReservation.create({
      tripId: testTrip._id,
      busId: testBus._id,
      travelDate: testTrip.travelDate,
      seatNumber: 'S7',
      userId: userB._id,
      status: 'booked',
    });

    const mockPaymentId = `pay_late_${Date.now()}`;
    const signature = paymentGateway.generateSignature(initRes.orderId, mockPaymentId);

    // Late payment arrives for userA: seat is already taken!
    const lateConfirm = await confirmPayment({
      gatewayOrderId: initRes.orderId,
      gatewayPaymentId: mockPaymentId,
      gatewaySignature: signature,
    });

    expect(lateConfirm.success).toBe(false);
    expect(lateConfirm.refundFlagged).toBe(true);

    const paymentDoc = await Payment.findOne({ gatewayOrderId: initRes.orderId });
    expect(paymentDoc.refundStatus).toBe('refund_required');
    expect(paymentDoc.status).toBe('failed');
  });
});
