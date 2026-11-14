import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';
import {
  User,
  Bus,
  Route,
  Trip,
  Pricing,
  Booking,
} from './models/index.js';
import { generateAccessToken } from './utils/token.js';

describe('OBTBS Admin APIs & Reports Engine', () => {
  let mongo;
  let app;
  let adminUser, adminToken;
  let customerUser, customerToken;
  let testBus, testRoute;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Trip.syncIndexes();
    await Pricing.syncIndexes();

    app = createApp();

    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'adminboss@test.com',
      password: 'adminpassword',
      phone: '9999900000',
      role: 'admin',
    });

    adminToken = generateAccessToken({
      userId: adminUser._id.toString(),
      role: 'admin',
      email: adminUser.email,
    });

    customerUser = await User.create({
      name: 'Regular Customer',
      email: 'regcust@test.com',
      password: 'custpassword',
      phone: '8888800000',
      role: 'user',
    });

    customerToken = generateAccessToken({
      userId: customerUser._id.toString(),
      role: 'user',
      email: customerUser.email,
    });

    testBus = await Bus.create({
      busNumber: 'ADMIN-BUS-99',
      busName: 'Royal Admin Sleeper',
      operator: 'Super Fleet',
      origin: 'Kolkata',
      destination: 'Ranchi',
      departureTime: '22:00',
      arrivalTime: '06:00',
      fare: 850,
      totalSeats: 36,
      deckType: 'double',
    });

    testRoute = await Route.create({
      origin: 'Kolkata',
      destination: 'Ranchi',
      distanceKm: 410,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('Customer accessing admin endpoints receives HTTP 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('Admin dashboard returns comprehensive SRS metrics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRegisteredBuses).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalRoutes).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalBookings).toBeDefined();
    expect(res.body.data.totalRevenue).toBeDefined();
  });

  it('Admin can create, list, update, and delete scheduled Trips', async () => {
    // 1. Create Trip
    const createRes = await request(app)
      .post('/api/admin/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        busId: testBus._id,
        routeId: testRoute._id,
        travelDate: '2026-11-28',
        departureTime: '22:00',
        arrivalTime: '06:00',
        baseFare: 850,
        status: 'scheduled',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.travelDate).toBe('2026-11-28');
    const tripId = createRes.body.data._id;

    // 2. List Trips
    const listRes = await request(app)
      .get('/api/admin/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ date: '2026-11-28' });

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);

    // 3. Update Trip
    const updateRes = await request(app)
      .put(`/api/admin/trips/${tripId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active', departureTime: '22:15' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.departureTime).toBe('22:15');

    // 4. Delete Trip
    const deleteRes = await request(app)
      .delete(`/api/admin/trips/${tripId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
  });

  it('Admin can manage dynamic multi-tier pricing rules', async () => {
    const createRes = await request(app)
      .post('/api/admin/pricing')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        busId: testBus._id,
        routeId: testRoute._id,
        seatType: 'sleeper',
        basePrice: 950,
        additionalCharges: 50,
        taxPercent: 5,
      });

    expect(createRes.status).toBe(201);
    const pricingId = createRes.body.data._id;

    const listRes = await request(app)
      .get('/api/admin/pricing')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ busId: testBus._id.toString() });

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);

    const deleteRes = await request(app)
      .delete(`/api/admin/pricing/${pricingId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
  });

  it('Admin can update physical seat configuration layout of a bus', async () => {
    const newLayout = [
      { seatNumber: 'L1', type: 'sleeper', position: 'lower', category: 'window', isLadies: false },
      { seatNumber: 'L2', type: 'sleeper', position: 'lower', category: 'aisle', isLadies: true },
    ];

    const res = await request(app)
      .put(`/api/admin/buses/${testBus._id}/layout`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ seatLayout: newLayout, totalSeats: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.seatLayout.length).toBe(2);
    expect(res.body.data.totalSeats).toBe(2);
  });
});
