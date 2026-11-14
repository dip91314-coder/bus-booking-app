import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import crypto from 'crypto';
import { createApp } from './app.js';
import { env } from './config/env.js';
import {
  User,
  Bus,
  Route,
  Trip,
  SeatReservation,
  Booking,
  Payment,
  Ticket,
} from './models/index.js';
import { generateAccessToken } from './utils/token.js';
import { paymentGateway } from './services/paymentGateway.js';

describe('OBTBS Customer API Endpoints & PDF Generation', () => {
  let mongo;
  let app;
  let customerUser, customerToken, otherCustomerToken;
  let testBus, testRoute, testTrip;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Trip.syncIndexes();
    await SeatReservation.syncIndexes();
    await Booking.syncIndexes();
    await Payment.syncIndexes();

    app = createApp();

    customerUser = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@test.com',
      password: 'password123',
      phone: '9888877777',
      role: 'user',
    });

    customerToken = generateAccessToken({
      userId: customerUser._id.toString(),
      role: 'user',
      email: customerUser.email,
    });

    const otherCustomer = await User.create({
      name: 'Another Customer',
      email: 'another@test.com',
      password: 'password123',
      phone: '9777766666',
      role: 'user',
    });
    otherCustomerToken = generateAccessToken({
      userId: otherCustomer._id.toString(),
      role: 'user',
      email: otherCustomer.email,
    });

    testBus = await Bus.create({
      busNumber: 'WB-09-XYZ',
      busName: 'Kolkata Volvo Liner',
      operator: 'Bengal Express',
      origin: 'Kolkata',
      destination: 'Siliguri',
      departureTime: '20:00',
      arrivalTime: '06:00',
      fare: 1000,
      totalSeats: 36,
      deckType: 'single',
    });

    testRoute = await Route.create({
      origin: 'Kolkata',
      source: 'Kolkata',
      destination: 'Siliguri',
      distanceKm: 560,
      estimatedDuration: '10h 00m',
      boardingPoints: [{ name: 'Esplanade', time: '20:00', landmark: 'Platform 4' }],
      droppingPoints: [{ name: 'Siliguri Junction', time: '06:00', landmark: 'Gate 1' }],
    });

    testTrip = await Trip.create({
      busId: testBus._id,
      routeId: testRoute._id,
      travelDate: '2026-11-20',
      departureTime: '20:00',
      arrivalTime: '06:00',
      baseFare: 1000,
      boardingPoints: testRoute.boardingPoints,
      droppingPoints: testRoute.droppingPoints,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('GET /api/trips searches trips matching source, destination, and travel date', async () => {
    const res = await request(app)
      .get('/api/trips')
      .query({ from: 'Kolkata', to: 'Siliguri', date: '2026-11-20' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].busNumber).toBe('WB-09-XYZ');
    expect(res.body.data[0].operator).toBe('YatraBus');
    expect(res.body.data[0].busName).toMatch(/^YatraBus\b/);
    expect(res.body.data[0].availableSeats).toBe(36);
  });

  it('GET /api/buses returns no unrelated buses when a route has no matches', async () => {
    const res = await request(app).get('/api/buses').query({ origin: 'Nowhere' });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET /api/trips/:tripId/seats returns full seating layout with statuses and pricing', async () => {
    const res = await request(app).get(`/api/trips/${testTrip._id}/seats`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSeats).toBe(36);
    expect(res.body.data.seats.length).toBe(36);
    expect(res.body.data.seats[0].seatNumber).toBe('S1');
    expect(res.body.data.seats[0].status).toBe('available');
    expect(res.body.data.seats[0].price).toBeGreaterThan(0);
  });

  it('POST /api/trips/:tripId/locks locks available seats for 8 minutes', async () => {
    const res = await request(app)
      .post(`/api/trips/${testTrip._id}/locks`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ seatNumbers: ['S1', 'S2'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.seats).toEqual(['S1', 'S2']);
    expect(res.body.data.lockExpiresAt).toBeDefined();
  });

  it('legacy seat holds cannot be taken or released by another customer', async () => {
    const holdRes = await request(app)
      .post('/api/seats/hold')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ busId: testBus._id, journeyDate: '2026-11-20', seatNumbers: ['S10'] });

    expect(holdRes.status).toBe(200);

    const competingHold = await request(app)
      .post('/api/seats/hold')
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({ busId: testBus._id, journeyDate: '2026-11-20', seatNumbers: ['S10'] });

    expect(competingHold.status).toBe(409);

    await request(app)
      .post('/api/seats/release')
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({ busId: testBus._id, journeyDate: '2026-11-20', seatNumbers: ['S10'] });

    const heldSeats = await request(app)
      .get(`/api/seats/${testBus._id}`)
      .query({ date: '2026-11-20' });
    expect(heldSeats.body.data.heldSeats).toContain('S10');

    const releaseRes = await request(app)
      .post('/api/seats/release')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ busId: testBus._id, journeyDate: '2026-11-20', seatNumbers: ['S10'] });
    expect(releaseRes.body.data.releasedCount).toBe(1);
  });

  it('legacy bookings require authentication and an active owned seat hold', async () => {
    const payload = {
      busId: testBus._id,
      journeyDate: '2026-11-20',
      boardingPoint: 'Esplanade',
      droppingPoint: 'Siliguri Junction',
      seats: ['S12'],
      passengers: [{ name: 'Rohan Sharma', age: 29, gender: 'male', seatNumber: 'S12' }],
      contactEmail: 'rohan@test.com',
      contactPhone: '9888877777',
    };

    const unauthenticated = await request(app).post('/api/bookings').send(payload);
    expect(unauthenticated.status).toBe(401);

    const noHold = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);
    expect(noHold.status).toBe(409);

    const hold = await request(app)
      .post('/api/seats/hold')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ busId: testBus._id, journeyDate: payload.journeyDate, seatNumbers: payload.seats });
    expect(hold.status).toBe(200);

    const booking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);
    expect(booking.status).toBe(201);
    expect(booking.body.data.operator).toBe('YatraBus');

    const seat = await request(app)
      .get(`/api/seats/${testBus._id}`)
      .query({ date: payload.journeyDate });
    expect(seat.body.data.bookedSeats).toContain('S12');
  });

  it('cancelling a trip booking releases its reservation and marks payment refunded', async () => {
    const booking = await Booking.create({
      bookingReference: 'BK-CANCEL-TRIP-1',
      userId: customerUser._id,
      tripId: testTrip._id,
      busId: testBus._id,
      busName: testBus.busName,
      operator: testBus.operator,
      busNumber: testBus.busNumber,
      busType: testBus.busType,
      origin: 'Kolkata',
      destination: 'Siliguri',
      journeyDate: '2026-11-20',
      departureTime: '20:00',
      arrivalTime: '06:00',
      boardingPoint: 'Esplanade',
      droppingPoint: 'Siliguri Junction',
      seats: ['S13'],
      passengers: [{ name: 'Rohan Sharma', age: 29, gender: 'male', seatNumber: 'S13' }],
      totalFare: 1050,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      contactEmail: 'rohan@test.com',
      contactPhone: '9888877777',
    });
    await SeatReservation.create({
      tripId: testTrip._id,
      busId: testBus._id,
      travelDate: '2026-11-20',
      seatNumber: 'S13',
      bookingId: booking._id,
      userId: customerUser._id,
      status: 'booked',
      lockExpiresAt: null,
    });
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: customerUser._id,
      amount: 1050,
      transactionReference: 'TXN-CANCEL-TRIP-1',
      status: 'successful',
    });

    const response = await request(app)
      .post(`/api/bookings/${booking._id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Travel plan changed' });

    expect(response.status).toBe(200);
    expect(await SeatReservation.findOne({ bookingId: booking._id })).toBeNull();
    expect((await Payment.findById(payment._id)).status).toBe('refunded');
  });

  it('POST /api/bookings creates pending booking and recomputes price strictly on backend', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        tripId: testTrip._id,
        boardingPoint: 'Esplanade',
        droppingPoint: 'Siliguri Junction',
        passengers: [
          { name: 'Rohan Sharma', age: 29, gender: 'male', seatNumber: 'S1' },
          { name: 'Pooja Sharma', age: 27, gender: 'female', seatNumber: 'S2' },
        ],
        contactEmail: 'rohan@test.com',
        contactPhone: '9888877777',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingStatus).toBe('pending');
    expect(res.body.data.pnr).toBeDefined();
    expect(res.body.data.totalFare).toBeGreaterThan(0);
  });

  it('POST /api/payments/verify requires a gateway signature', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .send({ orderId: 'order_missing_signature', paymentId: 'pay_missing_signature' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ValidationError');
  });

  it('POST /api/payments/webhook verifies the exact raw request body', async () => {
    const rawBody = JSON.stringify({ event: 'payment.authorized' });
    const signature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Full payment workflow: initiate -> verify -> digital ticket issued', async () => {
    // 1. Lock seat S5
    await request(app)
      .post(`/api/trips/${testTrip._id}/locks`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ seatNumbers: ['S5'] });

    // 2. Create pending booking
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        tripId: testTrip._id,
        passengers: [{ name: 'Ticket Tester', age: 26, gender: 'male', seatNumber: 'S5' }],
        contactEmail: 'tester@test.com',
        contactPhone: '9888877777',
      });

    const bookingId = bookingRes.body.data.bookingId;

    // 3. Initiate Payment
    const initRes = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ bookingId });

    expect(initRes.status).toBe(200);
    const orderId = initRes.body.data.orderId;

    // 4. Verify payment with signature
    const paymentId = `pay_cust_test_${Date.now()}`;
    const signature = paymentGateway.generateSignature(orderId, paymentId);

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .send({ orderId, paymentId, signature });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.success).toBe(true);
    expect(verifyRes.body.data.ticket).toBeDefined();

    const pnr = verifyRes.body.data.ticket.pnr;

    // 5. Fetch Ticket Details
    const ownBookingRes = await request(app)
      .get(`/api/bookings/${pnr}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(ownBookingRes.status).toBe(200);

    const otherBookingRes = await request(app)
      .get(`/api/bookings/${pnr}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    expect(otherBookingRes.status).toBe(404);

    const ticketRes = await request(app)
      .get(`/api/tickets/pnr/${pnr}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(ticketRes.status).toBe(200);
    expect(ticketRes.body.data.pnr).toBe(pnr);

    const otherTicketRes = await request(app)
      .get(`/api/tickets/pnr/${pnr}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    expect(otherTicketRes.status).toBe(404);

    // 6. Download PDF Ticket
    const pdfRes = await request(app)
      .get(`/api/tickets/pnr/${pnr}/pdf`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(pdfRes.status).toBe(200);
    expect(pdfRes.header['content-type']).toContain('application/pdf');
    expect(pdfRes.header['content-disposition']).toContain(`attachment; filename=ticket-${pnr}.pdf`);
    expect(pdfRes.body.length).toBeGreaterThan(100);
  });
});
