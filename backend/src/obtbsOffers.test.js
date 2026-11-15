import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';
import { Offer, Bus, Route, Trip, Pricing } from './models/index.js';

describe('Offers Public API & Validation Service', () => {
  let mongo;
  let app;
  let testTrip;

  const TEST_OFFERS = [
    {
      code: 'YATRAFIRST',
      title: 'Flat 15% OFF for First Time Passengers',
      description: 'Get instant 15% discount up to ₹200 on your first booking with YatraBus.',
      discountType: 'percent',
      value: 15,
      maxDiscount: 200,
      minAmount: 500,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      usageLimit: 1000,
      usedCount: 48,
      applicableRoutes: [],
      isActive: true,
      status: 'Active',
    },
    {
      code: 'FESTIVE50',
      title: 'Special ₹50 OFF Festive Travel',
      description: 'Flat ₹50 savings across all festival season bus routes nationwide.',
      discountType: 'flat',
      value: 50,
      maxDiscount: 50,
      minAmount: 400,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      usageLimit: 500,
      usedCount: 112,
      applicableRoutes: [],
      isActive: true,
      status: 'Active',
    },
    {
      code: 'DIGHA100',
      title: 'Flat ₹100 OFF on Kolkata-Digha Express',
      description: 'Save ₹100 on every seat booked along the Kolkata to Digha coastal corridor.',
      discountType: 'flat',
      value: 100,
      maxDiscount: 100,
      minAmount: 300,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      usageLimit: 300,
      usedCount: 42,
      applicableRoutes: ['Kolkata-Digha', 'Kolkata to Digha'],
      isActive: true,
      status: 'Active',
    },
    {
      code: 'JAIPUR15',
      title: '15% OFF on Delhi-Jaipur Highway Express',
      description: 'Enjoy 15% off up to ₹150 for your Pink City weekend heritage getaway.',
      discountType: 'percent',
      value: 15,
      maxDiscount: 150,
      minAmount: 500,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      usageLimit: 400,
      usedCount: 75,
      applicableRoutes: ['Delhi-Jaipur', 'Delhi to Jaipur'],
      isActive: true,
      status: 'Active',
    },
    {
      code: 'WEEKEND20',
      title: 'Weekend Getaway 20% Discount',
      description: 'Get 20% discount up to ₹250 on premium AC and sleeper weekend departures.',
      discountType: 'percent',
      value: 20,
      maxDiscount: 250,
      minAmount: 600,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      usageLimit: 600,
      usedCount: 89,
      applicableRoutes: [],
      isActive: true,
      status: 'Active',
    },
    {
      code: 'UPIBANK75',
      title: 'Flat ₹75 Cashback with Instant UPI & RuPay',
      description: 'Flat ₹75 instant savings when paying via UPI VPA or RuPay debit cards.',
      discountType: 'flat',
      value: 75,
      maxDiscount: 75,
      minAmount: 500,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      usageLimit: 1500,
      usedCount: 320,
      applicableRoutes: [],
      isActive: true,
      status: 'Active',
    },
    {
      code: 'EXPIRED30',
      title: 'Monsoon Saver 30% OFF',
      description: 'Past seasonal discount offer for monsoon travel corridors (expired test voucher).',
      discountType: 'percent',
      value: 30,
      maxDiscount: 300,
      minAmount: 400,
      validFrom: '2025-06-01',
      validTo: '2025-08-31',
      expiryDate: '2025-08-31',
      usageLimit: 200,
      usedCount: 200,
      applicableRoutes: [],
      isActive: true,
      status: 'Expired',
    },
    {
      code: 'INACTIVE10',
      title: 'Early Bird 10% OFF',
      description: 'Deactivated promotional voucher code for system testing.',
      discountType: 'percent',
      value: 10,
      maxDiscount: 100,
      minAmount: 300,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      usageLimit: 100,
      usedCount: 0,
      applicableRoutes: [],
      isActive: false,
      status: 'Disabled',
    },
  ];

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Offer.syncIndexes();
    app = createApp();

    // Idempotent upsert of test offers
    for (const off of TEST_OFFERS) {
      await Offer.findOneAndUpdate(
        { code: off.code },
        { $set: off },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const testBus = await Bus.create({
      busNumber: 'WB-01-OF-1000',
      name: 'Yatra Promo Coach',
      operator: 'YatraBus',
      category: 'AC Sleeper',
      origin: 'Kolkata',
      destination: 'Digha',
      departureTime: '06:00 AM',
      arrivalTime: '10:30 AM',
      totalSeats: 30,
      fare: 600,
      baseFare: 600,
    });

    const testRoute = await Route.create({
      origin: 'Kolkata',
      destination: 'Digha',
      source: 'Kolkata',
      distanceKm: 185,
      estimatedDuration: '4h 30m',
    });

    testTrip = await Trip.create({
      busId: testBus._id,
      routeId: testRoute._id,
      travelDate: '2026-12-20',
      departureDate: '2026-12-20',
      departureTime: '06:00 AM',
      arrivalTime: '10:30 AM',
      baseFare: 600,
      totalSeats: 30,
      status: 'scheduled',
    });

    await Pricing.create({
      routeId: testRoute._id,
      busId: testBus._id,
      basePrice: 600,
      multiplier: 1.0,
      finalPrice: 600,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('GET /api/offers returns only active and unexpired offers', async () => {
    const res = await request(app).get('/api/offers').expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const codes = res.body.data.map((o) => o.code);
    expect(codes).toContain('YATRAFIRST');
    expect(codes).toContain('FESTIVE50');
    expect(codes).toContain('DIGHA100');
    expect(codes).toContain('JAIPUR15');
    expect(codes).toContain('WEEKEND20');
    expect(codes).toContain('UPIBANK75');

    // Should NOT include expired or inactive
    expect(codes).not.toContain('EXPIRED30');
    expect(codes).not.toContain('INACTIVE10');
  });

  it('POST /api/offers/validate applies percentage discount with cap', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'YATRAFIRST',
        amount: 1000,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('YATRAFIRST');
    expect(res.body.data.discount).toBe(150); // 15% of 1000
    expect(res.body.data.finalAmount).toBe(850);
  });

  it('POST /api/offers/validate enforces maxDiscount cap', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'YATRAFIRST',
        amount: 2500, // 15% of 2500 would be 375, but maxDiscount is 200
      })
      .expect(200);

    expect(res.body.data.discount).toBe(200);
    expect(res.body.data.finalAmount).toBe(2300);
  });

  it('POST /api/offers/validate applies flat discount', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'FESTIVE50',
        amount: 500,
      })
      .expect(200);

    expect(res.body.data.discount).toBe(50);
    expect(res.body.data.finalAmount).toBe(450);
  });

  it('POST /api/offers/validate recomputes fare from tripId', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'DIGHA100',
        tripId: testTrip._id.toString(),
        seats: ['S1', 'S2'],
      })
      .expect(200);

    expect(res.body.data.originalAmount).toBe(1260); // 2 seats * 600 base + 5% GST = 1260
    expect(res.body.data.discount).toBe(100);
    expect(res.body.data.finalAmount).toBe(1160);
  });

  it('POST /api/offers/validate rejects when below minAmount', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'YATRAFIRST',
        amount: 400, // min is 500
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('minimum booking amount');
  });

  it('POST /api/offers/validate rejects expired coupon', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'EXPIRED30',
        amount: 800,
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('expired');
  });

  it('POST /api/offers/validate rejects inactive coupon', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'INACTIVE10',
        amount: 800,
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('inactive');
  });

  it('POST /api/offers/validate returns 404 for non-existent coupon', async () => {
    const res = await request(app)
      .post('/api/offers/validate')
      .send({
        code: 'BOGUS999',
        amount: 800,
      })
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  it('Verifies seed idempotency by running upserts twice', async () => {
    const initialCount = await Offer.countDocuments();
    expect(initialCount).toBe(8);

    // Run identical upsert batch again
    for (const off of TEST_OFFERS) {
      await Offer.findOneAndUpdate(
        { code: off.code },
        { $set: off },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const countAfterReSeed = await Offer.countDocuments();
    expect(countAfterReSeed).toBe(8);
  });
});
