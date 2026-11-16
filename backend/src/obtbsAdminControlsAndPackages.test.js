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
  TripPackage,
  TripNotification,
  AuditLog,
} from './models/index.js';
import { generateAccessToken } from './utils/token.js';

describe('OBTBS Admin Advanced Controls, Packages, and Safety Hardening', () => {
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
    await TripPackage.syncIndexes();

    app = createApp();

    adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@yatrabus.com',
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
      name: 'Rahul Verma',
      email: 'rahul@test.com',
      password: 'password123',
      phone: '9888877777',
      role: 'user',
      walletBalance: 100,
    });

    customerToken = generateAccessToken({
      userId: customerUser._id.toString(),
      role: 'user',
      email: customerUser.email,
    });

    testBus = await Bus.create({
      busNumber: 'MH-12-AB-9090',
      busName: 'YatraBus Royal AC Multi-Axle',
      operator: 'YatraBus',
      busType: 'AC Sleeper (2+1)',
      totalSeats: 36,
      origin: 'Mumbai',
      destination: 'Pune',
      departureTime: '06:00',
      arrivalTime: '09:30',
      fare: 500,
      deckType: 'double',
      seatLayout: Array.from({ length: 36 }, (_, i) => ({
        seatNumber: i < 18 ? `L${i + 1}` : `U${i - 17}`,
        type: 'sleeper',
        position: i < 18 ? 'lower' : 'upper',
        category: 'normal',
      })),
    });

    testRoute = await Route.create({
      origin: 'Mumbai',
      destination: 'Pune',
      distanceKm: 150,
      estimatedDurationHours: 3.5,
      boardingPoints: [{ name: 'Dadar TT Circle', timeOffsetMinutes: 0 }],
      droppingPoints: [{ name: 'Swargate', timeOffsetMinutes: 210 }],
    });

    await Pricing.create({
      busId: testBus._id,
      routeId: testRoute._id,
      seatType: 'all',
      basePrice: 500,
      weekendMultiplier: 1.2,
      sleeperMultiplier: 1.2,
      lowerBerthMultiplier: 1.1,
      frontRowMultiplier: 1.05,
      taxPercent: 5,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('1. Generates recurring trips across date range and skips conflicts gracefully', async () => {
    const res = await request(app)
      .post('/api/admin/trips/recurrence')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        routeId: testRoute._id.toString(),
        busId: testBus._id.toString(),
        departureTime: '06:00',
        arrivalTime: '09:30',
        recurrence: 'daily',
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        baseFare: 550,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(5);

    // Re-running the exact same generation should skip all 5 as conflicts
    const conflictRes = await request(app)
      .post('/api/admin/trips/recurrence')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        routeId: testRoute._id.toString(),
        busId: testBus._id.toString(),
        departureTime: '06:00',
        arrivalTime: '09:30',
        recurrence: 'daily',
        startDate: '2026-12-01',
        endDate: '2026-12-05',
      });

    expect(conflictRes.status).toBe(201);
    expect(conflictRes.body.count).toBe(0);
    expect(conflictRes.body.conflicts.length).toBe(5);
  });

  it('2. Computes live multi-tier price preview with weekend, sleeper and tax breakdown', async () => {
    const res = await request(app)
      .post('/api/admin/pricing/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        routeId: testRoute._id.toString(),
        busId: testBus._id.toString(),
        date: '2026-12-05', // Saturday (weekend)
        seatType: 'sleeper',
        position: 'lower',
        row: 1, // front row
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.basePrice).toBe(500);
    expect(res.body.data.appliedMultipliers.weekend).toBe(1.2);
    expect(res.body.data.appliedMultipliers.sleeper).toBe(1.2);
    expect(res.body.data.appliedMultipliers.lowerBerth).toBe(1.1);
    expect(res.body.data.appliedMultipliers.frontRow).toBe(1.05);
    expect(res.body.data.finalFare).toBeGreaterThan(500);
  });

  it('3. Blocks bus seat layout modification when future confirmed bookings exist', async () => {
    const today = new Date().toISOString().slice(0, 10);

    // Create a confirmed booking for today
    await Booking.create({
      bookingReference: 'BK-SAFE-01',
      pnr: 'PNRSAFE01',
      userId: customerUser._id,
      busId: testBus._id,
      busName: testBus.busName,
      operator: 'YatraBus',
      busNumber: testBus.busNumber,
      busType: testBus.busType,
      origin: 'Mumbai',
      destination: 'Pune',
      journeyDate: today,
      departureTime: '06:00',
      arrivalTime: '09:30',
      boardingPoint: 'Dadar',
      droppingPoint: 'Swargate',
      seats: ['L1'],
      passengers: [{ name: 'Rahul', age: 28, gender: 'male', seatNumber: 'L1' }],
      contactEmail: 'rahul@test.com',
      contactPhone: '9888877777',
      totalFare: 550,
      bookingStatus: 'confirmed',
      paymentStatus: 'successful',
    });

    const res = await request(app)
      .put(`/api/admin/buses/${testBus._id}/layout`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        totalSeats: 30,
        seatLayout: Array.from({ length: 30 }, (_, i) => ({
          seatNumber: `S${i + 1}`,
          type: 'seater',
          position: 'lower',
          category: 'normal',
        })),
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Cannot modify layout.*future trips/i);
  });

  it('4. Creates, retrieves, and filters Tour Packages (TripPackage)', async () => {
    const pkgPayload = {
      title: 'Konkan Coastal Paradise Tour',
      slug: 'konkan-coastal-paradise-test',
      category: 'Konkan',
      durationDays: 3,
      durationNights: 2,
      packageType: 'Coastal Route',
      pricePerPerson: 4200,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      routeDescription: 'Mumbai to Ganpatipule via Ratnagiri',
      departureCity: 'Mumbai',
      destinationCity: 'Ganpatipule',
      itinerary: [
        { day: 1, title: 'Mumbai to Ratnagiri', description: 'Scenic drive along Western Ghats.', meals: ['Lunch'] },
      ],
    };

    const createRes = await request(app)
      .post('/api/packages/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(pkgPayload);

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.slug).toBe('konkan-coastal-paradise-test');

    // Public retrieval
    const publicRes = await request(app).get('/api/packages?category=Konkan');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.count).toBeGreaterThanOrEqual(1);

    // Detail by slug
    const slugRes = await request(app).get('/api/packages/konkan-coastal-paradise-test');
    expect(slugRes.status).toBe(200);
    expect(slugRes.body.data.title).toBe('Konkan Coastal Paradise Tour');
  });

  it('5. Adjusts customer wallet balance and records AuditLog', async () => {
    const res = await request(app)
      .patch(`/api/admin/passengers/${customerUser._id}/wallet`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 250,
        reason: 'Loyalty reward bonus',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.walletBalance).toBe(350);

    // Verify audit log exists
    const auditRes = await request(app)
      .get('/api/admin/audit-logs?targetEntity=User')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.count).toBeGreaterThanOrEqual(1);
    expect(auditRes.body.data[0].action).toBe('ADJUST_WALLET');
  });

  it('6. Cancelling a scheduled trip triggers TripNotification for booked passenger', async () => {
    const trip = await Trip.create({
      busId: testBus._id,
      routeId: testRoute._id,
      travelDate: '2026-12-10',
      departureTime: '10:00',
      arrivalTime: '13:30',
      status: 'scheduled',
      baseFare: 600,
    });

    const booking = await Booking.create({
      bookingReference: 'BK-NOTIF-01',
      pnr: 'PNRNOTIF01',
      userId: customerUser._id,
      tripId: trip._id,
      busId: testBus._id,
      busName: testBus.busName,
      operator: 'YatraBus',
      busNumber: testBus.busNumber,
      busType: testBus.busType,
      origin: 'Mumbai',
      destination: 'Pune',
      journeyDate: '2026-12-10',
      departureTime: '10:00',
      arrivalTime: '13:30',
      boardingPoint: 'Dadar',
      droppingPoint: 'Swargate',
      seats: ['L2'],
      passengers: [{ name: 'Rahul', age: 28, gender: 'male', seatNumber: 'L2' }],
      contactEmail: 'rahul@test.com',
      contactPhone: '9888877777',
      totalFare: 600,
      bookingStatus: 'confirmed',
      paymentStatus: 'successful',
    });

    // Admin cancels the trip
    const cancelRes = await request(app)
      .put(`/api/admin/trips/${trip._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'cancelled' });

    expect(cancelRes.status).toBe(200);

    // Customer checks their notifications
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.count).toBeGreaterThanOrEqual(1);
    const cancellationNotif = notifRes.body.data.find((n) => n.type === 'CANCELLATION');
    expect(cancellationNotif).toBeDefined();
    expect(cancellationNotif.title).toContain('Trip Cancelled');
  });
});
