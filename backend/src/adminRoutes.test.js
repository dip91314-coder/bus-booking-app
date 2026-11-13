import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from './app.js';
import { User } from './models/User.js';
import { Bus } from './models/Bus.js';
import { Offer } from './models/Offer.js';
import { Route } from './models/Route.js';
import { BusSchedule } from './models/BusSchedule.js';
import { AdminNotification } from './models/AdminNotification.js';
import { PlatformSettings } from './models/PlatformSettings.js';
import { generateAccessToken } from './utils/token.js';

describe('Admin management API', () => {
  let mongo;
  let app;
  let adminToken;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    app = createApp();

    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'admin',
    });
    adminToken = generateAccessToken({ userId: admin._id.toString(), role: admin.role });
  });

  beforeEach(async () => {
    await Promise.all([
      Bus.deleteMany({}),
      Route.deleteMany({}),
      BusSchedule.deleteMany({}),
      Offer.deleteMany({}),
      AdminNotification.deleteMany({}),
      PlatformSettings.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('requires an authenticated administrator for admin resources', async () => {
    const response = await request(app).get('/api/admin/buses');
    expect(response.status).toBe(401);
  });

  it('creates buses using the admin form fields and returns the same contract', async () => {
    const response = await request(app)
      .post('/api/admin/buses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        busNumber: 'WB-04-E-5678',
        busName: 'Greenline Platinum Express',
        operator: 'Greenline Express',
        busType: 'AC Sleeper (2+1)',
        isAc: true,
        capacity: 36,
        fare: 1150,
        origin: 'Kolkata',
        destination: 'Siliguri',
        departureTime: '20:00',
        arrivalTime: '06:30',
        status: 'Active',
        amenities: ['AC', 'WiFi'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      capacity: 36,
      status: 'Active',
      isAc: true,
    });

    const listResponse = await request(app)
      .get('/api/admin/buses')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].id).toBe(response.body.data.id);

    await Bus.findByIdAndUpdate(response.body.data.id, { availableSeatsCount: 34 });
    const resized = await request(app)
      .put(`/api/admin/buses/${response.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacity: 35 });
    expect(resized.status).toBe(200);
    expect(resized.body.data.availableSeatsCount).toBe(33);

    const invalidResize = await request(app)
      .put(`/api/admin/buses/${response.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacity: 1 });
    expect(invalidResize.status).toBe(400);
  });

  it('persists offers and validates admin payloads', async () => {
    const response = await request(app)
      .post('/api/admin/offers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: 'firstyatra',
        title: 'Welcome Discount',
        discountPercentage: 15,
        maxDiscount: 200,
        minBookingAmount: 500,
        expiryDate: '2027-01-31',
        usageLimit: 1000,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.code).toBe('FIRSTYATRA');

    const invalidResponse = await request(app)
      .post('/api/admin/offers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: '', title: 'Invalid', discountPercentage: 101, expiryDate: 'not-a-date' });
    expect(invalidResponse.status).toBe(400);
    expect(await Offer.countDocuments()).toBe(1);
  });

  it('creates schedules from admin bus and route records with frontend field names', async () => {
    const bus = await Bus.create({
      busNumber: 'WB-04-E-5678',
      busName: 'Greenline Platinum Express',
      operator: 'Greenline Express',
      busType: 'AC Sleeper (2+1)',
      origin: 'Kolkata',
      destination: 'Siliguri',
      departureTime: '20:00',
      arrivalTime: '06:30',
      fare: 1150,
      totalSeats: 36,
    });
    const route = await Route.create({
      origin: 'Kolkata',
      destination: 'Siliguri',
      distanceKm: 560,
      estimatedDuration: '10h 30m',
    });

    const response = await request(app)
      .post('/api/admin/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        busId: bus._id.toString(),
        routeId: route._id.toString(),
        journeyDate: '2027-01-20',
        departureTime: '20:00',
        arrivalTime: '06:30',
        fare: 1150,
        availableSeats: 36,
        totalSeats: 36,
        status: 'On Route',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      busId: bus._id.toString(),
      routeId: route._id.toString(),
      source: 'Kolkata',
      destination: 'Siliguri',
      status: 'On Route',
    });
  });

  it('persists admin notifications and merges settings updates', async () => {
    const notification = await request(app)
      .post('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Schedule update', message: 'A new schedule was published.', category: 'alert' });
    expect(notification.status).toBe(201);

    const markedRead = await request(app)
      .patch(`/api/admin/notifications/${notification.body.data.id}/read`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(markedRead.body.data.read).toBe(true);

    await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ platformTitle: 'YatraBus' });
    const updatedSettings = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ taxGstRate: 5 });

    expect(updatedSettings.body.data).toMatchObject({ platformTitle: 'YatraBus', taxGstRate: 5 });
  });

  it('returns range-based analytics datasets for the report screen', async () => {
    const response = await request(app)
      .get('/api/admin/reports?timeframe=7D')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.summary).toMatchObject({
      totalBookings: 0,
      cancellationRate: '0%',
    });
    expect(response.body.data.revenueMonthly).toEqual(
      expect.arrayContaining([expect.objectContaining({ revenue: 0, bookings: 0 })])
    );
    expect(response.body.data).toHaveProperty('passengerGrowth');
    expect(response.body.data).toHaveProperty('busTypeStats');
  });

  it('does not allow public registration to assign the administrator role', async () => {
    const forbiddenRole = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'new-user@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'admin',
      });
    expect(forbiddenRole.status).toBe(400);

    const registered = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'new-user@example.com',
        password: 'password123',
        phone: '9876543211',
      });
    expect(registered.status).toBe(201);
    expect(registered.body.data.user.role).toBe('user');
  });

  it('prevents suspended passengers from continuing to use authenticated endpoints', async () => {
    const passenger = await User.create({
      name: 'Suspended Passenger',
      email: 'suspended@example.com',
      password: 'password123',
      phone: '9876543212',
      role: 'user',
    });
    const passengerToken = generateAccessToken({
      userId: passenger._id.toString(),
      role: passenger.role,
    });

    const suspended = await request(app)
      .patch(`/api/admin/passengers/${passenger._id.toString()}/status`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(suspended.status).toBe(200);
    expect(suspended.body.data.status).toBe('Suspended');

    const denied = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(denied.status).toBe(401);
  });
});
