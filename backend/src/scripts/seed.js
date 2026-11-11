import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { BusOperator } from '../models/BusOperator.js';
import { Bus } from '../models/Bus.js';
import { Route } from '../models/Route.js';
import { Booking } from '../models/Booking.js';
import { logger } from '../config/logger.js';

export async function seedDatabase() {
  try {
    await connectDB();
    logger.info('Purging legacy collections for clean seed...');
    await Promise.all([
      User.deleteMany({}),
      BusOperator.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    // 1. Create Users
    logger.info('Creating demo users...');
    const adminUser = await User.create({
      name: 'Vikram Das',
      email: 'admin@bharatbus.com',
      password: 'admin123',
      phone: '9811223344',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    });

    const regularUser = await User.create({
      name: 'Rahul Sen',
      email: 'rahul@yatra.com',
      password: 'rahul123',
      phone: '9876543210',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    });

    // 2. Create Operators
    logger.info('Creating fleet operators...');
    const operators = await BusOperator.create([
      { name: 'Greenline Express', contactNumber: '033-2287-9911', email: 'support@greenline.in', rating: 4.8 },
      { name: 'Royal Cruiser', contactNumber: '033-2255-4433', email: 'help@royalcruiser.com', rating: 4.6 },
      { name: 'Zingbus Intercity', contactNumber: '011-4455-6677', email: 'care@zingbus.com', rating: 4.9 },
      { name: 'VRL Travels', contactNumber: '022-2433-1122', email: 'info@vrltravels.com', rating: 4.7 },
      { name: 'SRS Travels', contactNumber: '080-2677-8899', email: 'booking@srstravels.in', rating: 4.5 },
    ]);

    // 3. Create Interstate Routes
    logger.info('Creating master routes...');
    await Route.create([
      { origin: 'Kolkata', destination: 'Siliguri', distanceKm: 560, estimatedDuration: '10h 30m', highwayNumber: 'NH-12' },
      { origin: 'Delhi', destination: 'Jaipur', distanceKm: 280, estimatedDuration: '5h 15m', highwayNumber: 'NH-48' },
      { origin: 'Mumbai', destination: 'Pune', distanceKm: 150, estimatedDuration: '3h 30m', highwayNumber: 'Mumbai-Pune Exp' },
      { origin: 'Bengaluru', destination: 'Chennai', distanceKm: 345, estimatedDuration: '6h 30m', highwayNumber: 'NH-48' },
      { origin: 'Delhi', destination: 'Manali', distanceKm: 535, estimatedDuration: '14h 00m', highwayNumber: 'NH-3' },
      { origin: 'Kolkata', destination: 'Varanasi', distanceKm: 680, estimatedDuration: '13h 00m', highwayNumber: 'NH-19' },
    ]);

    // 4. Create Master Buses
    logger.info('Creating scheduled bus coaches...');
    const buses = await Bus.create([
      {
        busNumber: 'WB-04-E-5678',
        busName: 'Greenline Platinum Express',
        operator: 'Greenline Express',
        busType: 'AC Sleeper (2+1)',
        origin: 'Kolkata',
        destination: 'Siliguri',
        departureTime: '20:00',
        arrivalTime: '06:30',
        journeyDuration: '10h 30m',
        fare: 1150,
        totalSeats: 36,
        availableSeatsCount: 16,
        deckType: 'double',
        rating: 4.8,
        reviewsCount: 342,
        hasLiveTracking: true,
        boardingPoints: [
          { id: 'bp-1', name: 'Esplanade Bus Terminus (Platform 4)', time: '20:00', landmark: 'Opposite Metro Cinema' },
          { id: 'bp-2', name: 'Karunamoyee Salt Lake', time: '20:45', landmark: 'Bus Bay 2' },
        ],
        droppingPoints: [
          { id: 'dp-1', name: 'Tenzing Norgay Bus Stand Siliguri', time: '06:00', landmark: 'Main Gate' },
          { id: 'dp-2', name: 'Siliguri Junction', time: '06:30', landmark: 'Near Railway Overbridge' },
        ],
      },
      {
        busNumber: 'WB-02-B-9911',
        busName: 'Royal Cruiser Volvo B11R',
        operator: 'Royal Cruiser',
        busType: 'Multi-Axle AC Seater (2+2)',
        origin: 'Kolkata',
        destination: 'Siliguri',
        departureTime: '21:30',
        arrivalTime: '08:00',
        journeyDuration: '10h 30m',
        fare: 890,
        totalSeats: 40,
        availableSeatsCount: 22,
        deckType: 'single',
        rating: 4.6,
        reviewsCount: 289,
        hasLiveTracking: true,
        boardingPoints: [
          { id: 'bp-101', name: 'Babughat Bus Stand', time: '21:30', landmark: 'Eden Gardens Gate 3' },
        ],
        droppingPoints: [
          { id: 'dp-101', name: 'Siliguri Tenzing Norgay Stand', time: '08:00', landmark: 'Platform 1' },
        ],
      },
      {
        busNumber: 'DL-01-TC-4400',
        busName: 'Zingbus Maxx AC Sleeper',
        operator: 'Zingbus Intercity',
        busType: 'AC Sleeper (2+1)',
        origin: 'Delhi',
        destination: 'Jaipur',
        departureTime: '06:30',
        arrivalTime: '11:45',
        journeyDuration: '5h 15m',
        fare: 650,
        totalSeats: 36,
        availableSeatsCount: 20,
        deckType: 'double',
        rating: 4.9,
        reviewsCount: 512,
        hasLiveTracking: true,
        boardingPoints: [
          { id: 'bp-201', name: 'Kashmere Gate Metro Gate 1', time: '06:30', landmark: 'Opposite Metro Station' },
        ],
        droppingPoints: [
          { id: 'dp-201', name: 'Sindhi Camp Bus Stand Jaipur', time: '11:30', landmark: 'Metro Pillar 12' },
        ],
      },
      {
        busNumber: 'MH-12-RN-7788',
        busName: 'VRL I-Shift Volvo Multi-Axle',
        operator: 'VRL Travels',
        busType: 'AC Sleeper (2+1)',
        origin: 'Mumbai',
        destination: 'Pune',
        departureTime: '07:00',
        arrivalTime: '10:30',
        journeyDuration: '3h 30m',
        fare: 450,
        totalSeats: 36,
        availableSeatsCount: 18,
        deckType: 'double',
        rating: 4.7,
        reviewsCount: 420,
        hasLiveTracking: true,
        boardingPoints: [
          { id: 'bp-301', name: 'Borivali (W) Gokul Hotel', time: '07:00', landmark: 'SV Road' },
        ],
        droppingPoints: [
          { id: 'dp-301', name: 'Wakad Hinjewadi Flyover', time: '10:00', landmark: 'Ginger Hotel' },
        ],
      },
      {
        busNumber: 'KA-01-F-1100',
        busName: 'SRS Diamond Class Multi-Axle',
        operator: 'SRS Travels',
        busType: 'AC Sleeper (2+1)',
        origin: 'Bengaluru',
        destination: 'Chennai',
        departureTime: '23:00',
        arrivalTime: '05:30',
        journeyDuration: '6h 30m',
        fare: 799,
        totalSeats: 36,
        availableSeatsCount: 15,
        deckType: 'double',
        rating: 4.5,
        reviewsCount: 310,
        hasLiveTracking: true,
        boardingPoints: [
          { id: 'bp-401', name: 'Kempegowda Bus Station (Majestic)', time: '23:00', landmark: 'Platform 18' },
        ],
        droppingPoints: [
          { id: 'dp-401', name: 'Koyambedu CMBT Chennai', time: '05:15', landmark: 'Omni Bus Stand' },
        ],
      },
      {
        busNumber: 'HP-01-A-7007',
        busName: 'Himalayan Golden Volvo B9R',
        operator: 'Himalayan Golden Bus',
        busType: 'Multi-Axle AC Seater (2+2)',
        origin: 'Delhi',
        destination: 'Manali',
        departureTime: '18:30',
        arrivalTime: '08:30',
        journeyDuration: '14h 00m',
        fare: 1450,
        totalSeats: 40,
        availableSeatsCount: 12,
        deckType: 'single',
        rating: 4.9,
        reviewsCount: 680,
        hasLiveTracking: true,
        boardingPoints: [
          { id: 'bp-501', name: 'Majnu Ka Tilla Gurudwara', time: '18:30', landmark: 'Near Tibetan Market' },
        ],
        droppingPoints: [
          { id: 'dp-501', name: 'Private Bus Stand Manali', time: '08:00', landmark: 'Mall Road Entrance' },
        ],
      },
    ]);

    // 5. Initial Sample Booking
    logger.info('Creating initial confirmed ticket...');
    const greenlineBus = buses[0];
    await Booking.create({
      bookingReference: 'BK-98F42A7C',
      userId: regularUser._id,
      busId: greenlineBus._id,
      busName: greenlineBus.busName,
      operator: greenlineBus.operator,
      busNumber: greenlineBus.busNumber,
      busType: greenlineBus.busType,
      origin: greenlineBus.origin,
      destination: greenlineBus.destination,
      journeyDate: '2026-11-20',
      departureTime: greenlineBus.departureTime,
      arrivalTime: greenlineBus.arrivalTime,
      boardingPoint: 'Esplanade Bus Terminus (Platform 4)',
      droppingPoint: 'Tenzing Norgay Bus Stand Siliguri',
      seats: ['L1', 'L4'],
      passengers: [
        { name: 'Rahul Sen', age: 24, gender: 'male', seatNumber: 'L1' },
        { name: 'Ananya Sen', age: 22, gender: 'female', seatNumber: 'L4' },
      ],
      totalFare: 2300,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'UPI (rahul@oksbi)',
      contactEmail: regularUser.email,
      contactPhone: regularUser.phone,
    });

    logger.info('Database seeded successfully!');
  } catch (error) {
    logger.error({ error }, 'Database seeding failed');
    throw error;
  } finally {
    await disconnectDB();
  }
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase().catch(() => process.exit(1));
}
