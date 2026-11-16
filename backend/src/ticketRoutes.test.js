import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from './app.js';
import { User } from './models/User.js';
import { Booking } from './models/Booking.js';
import { Ticket } from './models/Ticket.js';
import { TripNotification } from './models/TripNotification.js';
import { generateAccessToken } from './utils/token.js';

const collectBuffer = (response, callback) => {
  const chunks = [];
  response.on('data', (chunk) => chunks.push(chunk));
  response.on('end', () => callback(null, Buffer.concat(chunks)));
};

describe('Ticket download API', () => {
  let mongo;
  let app;
  let customer;
  let customerToken;
  let otherToken;
  let booking;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    app = createApp();
    customer = await User.create({
      name: 'Ticket Owner',
      email: 'ticket-owner@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'user',
    });
    const otherCustomer = await User.create({
      name: 'Other Customer',
      email: 'other-customer@example.com',
      password: 'password123',
      phone: '9876543211',
      role: 'user',
    });
    customerToken = generateAccessToken({ userId: customer._id.toString(), role: 'user' });
    otherToken = generateAccessToken({ userId: otherCustomer._id.toString(), role: 'user' });
  });

  beforeEach(async () => {
    await Promise.all([Booking.deleteMany({}), Ticket.deleteMany({}), TripNotification.deleteMany({})]);
    booking = await Booking.create({
      bookingReference: 'BK-ARCHIVE01',
      pnr: 'BK-ARCHIVE01',
      userId: customer._id,
      busId: new mongoose.Types.ObjectId(),
      busName: 'YatraBus Premium Sleeper',
      operator: 'YatraBus',
      busNumber: 'WB-04-E-5678',
      busType: 'AC Sleeper (2+1)',
      origin: 'Kolkata',
      destination: 'Siliguri',
      from_location: 'Kolkata',
      to_location: 'Siliguri',
      pickup_point: 'Esplanade',
      drop_point: 'Tenzing Norgay Bus Terminus',
      journeyDate: '2025-01-15',
      departureTime: '20:00',
      arrivalTime: '06:30',
      boardingPoint: 'Esplanade',
      droppingPoint: 'Tenzing Norgay Bus Terminus',
      seats: ['L1'],
      passengers: [{ name: 'Asha Sen', age: 32, gender: 'female', seatNumber: 'L1' }],
      priceBreakdown: { basePrice: 1100, taxAmount: 55, totalAmount: 1155 },
      totalFare: 1155,
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'UPI',
      contactEmail: 'ticket-owner@example.com',
      contactPhone: '9876543210',
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('generates a downloadable PDF from a stored booking when no ticket snapshot remains', async () => {
    const response = await request(app)
      .get(`/api/tickets/${booking.pnr}/pdf`)
      .set('Authorization', `Bearer ${customerToken}`)
      .buffer(true)
      .parse(collectBuffer);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain(booking.pnr);
    expect(response.body.subarray(0, 4).toString()).toBe('%PDF');
    expect(await TripNotification.findOne({
      userId: customer._id,
      bookingId: booking._id,
      category: 'ticket',
    })).toMatchObject({ title: 'Ticket downloaded' });

    const ticketResponse = await request(app)
      .get(`/api/tickets/${booking.pnr}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(ticketResponse.status).toBe(200);
    expect(ticketResponse.body.data).toMatchObject({
      bookingStatus: 'completed',
      paymentMethod: 'UPI',
      seats: ['L1'],
      passengerSnapshot: [{ name: 'Asha Sen', seatNumber: 'L1' }],
    });
  });

  it('does not expose tickets to another customer and rejects cancelled bookings', async () => {
    const otherResponse = await request(app)
      .get(`/api/tickets/${booking.pnr}/pdf`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(otherResponse.status).toBe(404);

    booking.bookingStatus = 'cancelled';
    await booking.save();
    const cancelledResponse = await request(app)
      .get(`/api/tickets/${booking.pnr}/pdf`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(cancelledResponse.status).toBe(404);
  });
});
