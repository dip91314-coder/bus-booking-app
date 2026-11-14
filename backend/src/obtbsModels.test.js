import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Bus,
  Route,
  Trip,
  Pricing,
  SeatReservation,
  Booking,
  Payment,
  Ticket,
} from './models/index.js';

describe('OBTBS Models & Schema Validations', () => {
  let mongo;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Trip.syncIndexes();
    await SeatReservation.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('generates a default physical seatLayout on Bus when not provided', async () => {
    const bus = await Bus.create({
      busNumber: 'TEST-BUS-01',
      busName: 'Test Express',
      operator: 'Test Operator',
      origin: 'Kolkata',
      destination: 'Digha',
      departureTime: '06:00',
      arrivalTime: '10:30',
      fare: 500,
      totalSeats: 36,
      deckType: 'double',
    });

    expect(bus.seatLayout).toBeDefined();
    expect(bus.seatLayout.length).toBe(36);
    expect(bus.seatLayout[0].seatNumber).toBe('L1');
    expect(bus.seatLayout[18].seatNumber).toBe('U1');
  });

  it('prevents scheduling duplicate trips for the same bus at the same date and time', async () => {
    const bus = await Bus.create({
      busNumber: 'TEST-BUS-02',
      busName: 'Express 02',
      operator: 'Test Operator',
      origin: 'Delhi',
      destination: 'Jaipur',
      departureTime: '07:00',
      arrivalTime: '12:00',
      fare: 600,
    });

    const route = await Route.create({
      origin: 'Delhi',
      destination: 'Jaipur',
      distanceKm: 280,
    });

    await Trip.create({
      busId: bus._id,
      routeId: route._id,
      travelDate: '2026-11-20',
      departureTime: '07:00',
      arrivalTime: '12:00',
    });

    // Try creating duplicate trip
    await expect(
      Trip.create({
        busId: bus._id,
        routeId: route._id,
        travelDate: '2026-11-20',
        departureTime: '07:00',
        arrivalTime: '12:00',
      })
    ).rejects.toThrow();
  });

  it('enforces compound unique index on (tripId, seatNumber) in SeatReservation', async () => {
    const bus = await Bus.create({
      busNumber: 'TEST-BUS-03',
      busName: 'Express 03',
      operator: 'Test Operator',
      origin: 'Mumbai',
      destination: 'Pune',
      departureTime: '08:00',
      arrivalTime: '11:00',
      fare: 400,
    });

    const route = await Route.create({
      origin: 'Mumbai',
      destination: 'Pune',
      distanceKm: 150,
    });

    const trip = await Trip.create({
      busId: bus._id,
      routeId: route._id,
      travelDate: '2026-11-20',
      departureTime: '08:00',
      arrivalTime: '11:00',
    });

    await SeatReservation.create({
      tripId: trip._id,
      busId: bus._id,
      travelDate: '2026-11-20',
      seatNumber: 'A1',
      status: 'locked',
    });

    // Attempt concurrent duplicate lock on the exact same trip and seat
    await expect(
      SeatReservation.create({
        tripId: trip._id,
        busId: bus._id,
        travelDate: '2026-11-20',
        seatNumber: 'A1',
        status: 'locked',
      })
    ).rejects.toThrow();

    // But allows the same seat number on a DIFFERENT trip or date
    const trip2 = await Trip.create({
      busId: bus._id,
      routeId: route._id,
      travelDate: '2026-11-21',
      departureTime: '08:00',
      arrivalTime: '11:00',
    });

    const differentTripRes = await SeatReservation.create({
      tripId: trip2._id,
      busId: bus._id,
      travelDate: '2026-11-21',
      seatNumber: 'A1',
      status: 'locked',
    });

    expect(differentTripRes).toBeDefined();
    expect(differentTripRes.seatNumber).toBe('A1');
  });

  it('correctly resolves dynamic pricing according to the SRS hierarchy', async () => {
    const bus = await Bus.create({
      busNumber: 'TEST-BUS-04',
      busName: 'Express 04',
      operator: 'Test Operator',
      origin: 'Bengaluru',
      destination: 'Chennai',
      departureTime: '10:00',
      arrivalTime: '16:00',
      fare: 700,
    });

    const route = await Route.create({
      origin: 'Bengaluru',
      destination: 'Chennai',
      distanceKm: 345,
    });

    // 1. Fallback to bus default
    const busDefault = await Pricing.resolvePrice({ busId: bus._id, seatType: 'seater' });
    expect(busDefault.basePrice).toBe(700);

    // 2. Route level pricing
    await Pricing.create({
      routeId: route._id,
      seatType: 'seater',
      basePrice: 750,
      additionalCharges: 20,
      taxPercent: 5,
    });

    const routePrice = await Pricing.resolvePrice({
      routeId: route._id,
      busId: bus._id,
      seatType: 'seater',
    });
    expect(routePrice.basePrice).toBe(750);
    expect(routePrice.additionalCharges).toBe(20);

    // 3. Trip level pricing overrides route
    const trip = await Trip.create({
      busId: bus._id,
      routeId: route._id,
      travelDate: '2026-11-25',
      departureTime: '10:00',
      arrivalTime: '16:00',
    });

    await Pricing.create({
      tripId: trip._id,
      seatType: 'seater',
      basePrice: 900,
      additionalCharges: 50,
      taxPercent: 5,
    });

    const tripPrice = await Pricing.resolvePrice({
      tripId: trip._id,
      routeId: route._id,
      busId: bus._id,
      seatType: 'seater',
    });
    expect(tripPrice.basePrice).toBe(900);
    expect(tripPrice.additionalCharges).toBe(50);
  });
});
