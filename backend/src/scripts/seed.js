import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  BusOperator,
  Bus,
  Route,
  Trip,
  Pricing,
  SeatReservation,
  Booking,
  Payment,
  Ticket,
  Driver,
  Staff,
  Offer,
  AdminNotification,
  PlatformSettings,
  Cancellation,
  Seat,
  Destination,
  JournalEntry,
  SavedPassenger,
  TripPackage,
  AuditLog,
} from '../models/index.js';
import { logger } from '../config/logger.js';

export async function seedDatabase() {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database seeding is disabled in production.');
    }

    await connectDB();
    logger.info('Purging collections for clean seed...');
    await Promise.all([
      User.deleteMany({}),
      BusOperator.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      Trip.deleteMany({}),
      Pricing.deleteMany({}),
      SeatReservation.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Ticket.deleteMany({}),
      Driver.deleteMany({}),
      Staff.deleteMany({}),
      Offer.deleteMany({}),
      AdminNotification.deleteMany({}),
      PlatformSettings.deleteMany({}),
      Cancellation.deleteMany({}),
      Seat.deleteMany({}),
      Destination.deleteMany({}),
      JournalEntry.deleteMany({}),
      SavedPassenger.deleteMany({}),
      TripPackage.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 1. Create Users
    logger.info('Creating demo users and administrators...');
    const adminPassword =
      process.env.ADMIN_SEED_PASSWORD ||
      (process.env.NODE_ENV !== 'production' ? 'admin123' : crypto.randomBytes(12).toString('hex'));

    const adminUser = await User.create({
      name: 'Vikram Das',
      email: 'admin@yatrabus.com',
      password: adminPassword,
      phone: '9811223344',
      role: 'admin',
      city: 'Kolkata',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    });

    await User.create({
      name: 'Vikram Das',
      email: 'admin@bharatbus.com',
      password: adminPassword,
      phone: '9811223344',
      role: 'admin',
      city: 'Kolkata',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    });

    const user1 = await User.create({
      name: 'Rahul Sen',
      email: 'rahul@yatra.com',
      password: 'rahul123',
      phone: '9876543210',
      role: 'user',
      city: 'Kolkata',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    });

    const user2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@yatra.com',
      password: 'priya123',
      phone: '9812345678',
      role: 'user',
      city: 'Delhi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    });

    const user3 = await User.create({
      name: 'Amit Patel',
      email: 'amit@yatra.com',
      password: 'amit123',
      phone: '9823456789',
      role: 'user',
      city: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    });

    const user4 = await User.create({
      name: 'Sneha Roy',
      email: 'sneha@yatra.com',
      password: 'sneha123',
      phone: '9834567890',
      role: 'user',
      city: 'Pune',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    });

    const user5 = await User.create({
      name: 'Arjun Nair',
      email: 'arjun@yatra.com',
      password: 'arjun123',
      phone: '9845678901',
      role: 'user',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    });

    // 2. Create Operators
    logger.info('Creating YatraBus fleet operator...');
    const operator = await BusOperator.create({
      name: 'YatraBus',
      contactNumber: '1800-250-8737',
      email: 'support@yatrabus.in',
      rating: 4.8,
    });

    // 3. Create Routes
    logger.info('Creating master routes with boarding & dropping points...');
    const routes = await Route.create([
      {
        origin: 'Kolkata',
        source: 'Kolkata',
        destination: 'Digha',
        departurePoint: 'Esplanade Central Bus Stand',
        arrivalPoint: 'Digha Sea Beach Bus Terminal',
        distanceKm: 185,
        estimatedDuration: '4h 15m',
        durationMinutes: 255,
        highwayNumber: 'NH-116B',
        baseFare: 350,
        boardingPoints: [
          { name: 'Esplanade Bus Terminus (Platform 2)', time: '07:00', landmark: 'Opposite Metro Cinema' },
          { name: 'Santragachi Railway Bus Stop', time: '07:45', landmark: 'Kona Expressway Bridge' },
          { name: 'Kolaghat Highway Point', time: '08:45', landmark: 'Expressway Dhaba' },
        ],
        droppingPoints: [
          { name: 'Old Digha Bus Stand', time: '11:00', landmark: 'Near Sea Beach Road' },
          { name: 'New Digha Central Bus Terminal', time: '11:15', landmark: 'Opposite State Guest House' },
        ],
      },
      {
        origin: 'Kolkata',
        source: 'Kolkata',
        destination: 'Siliguri',
        departurePoint: 'Esplanade Central Bus Terminal',
        arrivalPoint: 'Siliguri Junction Bus Station',
        distanceKm: 560,
        estimatedDuration: '10h 30m',
        durationMinutes: 630,
        highwayNumber: 'NH-12',
        baseFare: 890,
        boardingPoints: [
          { name: 'Esplanade Bus Terminus (Platform 4)', time: '20:00', landmark: 'Opposite Metro Cinema' },
          { name: 'Karunamoyee Salt Lake', time: '20:45', landmark: 'Bus Bay 2' },
          { name: 'Airport Gate 1 Bus Stop', time: '21:15', landmark: 'Near VIP Road' },
        ],
        droppingPoints: [
          { name: 'Tenzing Norgay Bus Stand Siliguri', time: '06:00', landmark: 'Main Gate' },
          { name: 'Siliguri Junction', time: '06:30', landmark: 'Near Railway Overbridge' },
        ],
      },
      {
        origin: 'Delhi',
        source: 'Delhi',
        destination: 'Jaipur',
        departurePoint: 'Kashmere Gate ISBT',
        arrivalPoint: 'Sindhi Camp Central Bus Stand',
        distanceKm: 280,
        estimatedDuration: '5h 15m',
        durationMinutes: 315,
        highwayNumber: 'NH-48',
        baseFare: 550,
        boardingPoints: [
          { name: 'Kashmere Gate Metro Gate 1', time: '06:30', landmark: 'Opposite Metro Station' },
          { name: 'Dhaula Kuan Metro Station', time: '07:15', landmark: 'Under Flyover' },
          { name: 'IFFCO Chowk Gurugram', time: '07:50', landmark: 'Subway Exit' },
        ],
        droppingPoints: [
          { name: 'Sindhi Camp Bus Stand Jaipur', time: '11:30', landmark: 'Metro Pillar 12' },
          { name: 'Narayan Singh Circle', time: '11:45', landmark: 'Near Police Post' },
        ],
      },
      {
        origin: 'Mumbai',
        source: 'Mumbai',
        destination: 'Pune',
        departurePoint: 'Borivali Highway Bus Depot',
        arrivalPoint: 'Swargate Bus Stand Pune',
        distanceKm: 150,
        estimatedDuration: '3h 30m',
        durationMinutes: 210,
        highwayNumber: 'Mumbai-Pune Exp',
        baseFare: 400,
        boardingPoints: [
          { name: 'Borivali (W) Gokul Hotel', time: '07:00', landmark: 'SV Road' },
          { name: 'Dadar Asiad Bus Stand', time: '07:35', landmark: 'Opposite Flower Market' },
          { name: 'Vashi Plaza', time: '08:15', landmark: 'Highway Stop' },
        ],
        droppingPoints: [
          { name: 'Wakad Hinjewadi Flyover', time: '10:00', landmark: 'Ginger Hotel' },
          { name: 'Shivajinagar Bus Stand', time: '10:15', landmark: 'Near Railway Station' },
          { name: 'Swargate Stand', time: '10:30', landmark: 'Main Depot' },
        ],
      },
      {
        origin: 'Bengaluru',
        source: 'Bengaluru',
        destination: 'Chennai',
        departurePoint: 'Kempegowda Bus Station (Majestic)',
        arrivalPoint: 'Koyambedu CMBT Chennai',
        distanceKm: 345,
        estimatedDuration: '6h 30m',
        durationMinutes: 390,
        highwayNumber: 'NH-48',
        baseFare: 750,
        boardingPoints: [
          { name: 'Kempegowda Bus Station (Majestic)', time: '23:00', landmark: 'Platform 18' },
          { name: 'Shantinagar Bus Station', time: '23:25', landmark: 'Double Road' },
          { name: 'Electronic City Toll', time: '23:55', landmark: 'Flyover Exit' },
        ],
        droppingPoints: [
          { name: 'Poonamallee Bypass', time: '04:45', landmark: 'Toll Plaza' },
          { name: 'Koyambedu CMBT Chennai', time: '05:30', landmark: 'Omni Bus Stand' },
        ],
      },
      {
        origin: 'Delhi',
        source: 'Delhi',
        destination: 'Manali',
        departurePoint: 'Majnu Ka Tilla Depot',
        arrivalPoint: 'Private Bus Stand Manali',
        distanceKm: 535,
        estimatedDuration: '14h 00m',
        durationMinutes: 840,
        highwayNumber: 'NH-3',
        baseFare: 1350,
        boardingPoints: [
          { name: 'Majnu Ka Tilla Gurudwara', time: '18:30', landmark: 'Near Tibetan Market' },
          { name: 'Kashmere Gate Metro Gate 2', time: '19:15', landmark: 'ISBT' },
        ],
        droppingPoints: [
          { name: 'Kullu Bus Stand', time: '07:00', landmark: 'Near Beas Bridge' },
          { name: 'Private Bus Stand Manali', time: '08:30', landmark: 'Mall Road Entrance' },
        ],
      },
      {
        origin: 'Hyderabad',
        source: 'Hyderabad',
        destination: 'Bengaluru',
        departurePoint: 'MGBS Central Bus Station',
        arrivalPoint: 'Majestic Bus Stand Bengaluru',
        distanceKm: 570,
        estimatedDuration: '9h 15m',
        durationMinutes: 555,
        highwayNumber: 'NH-44',
        baseFare: 900,
        boardingPoints: [
          { name: 'MGBS CBS Hyderabad', time: '21:30', landmark: 'Platform 6' },
          { name: 'Ameerpet Metro Station', time: '22:00', landmark: 'Pillar 1024' },
          { name: 'Shamshabad Airport Toll', time: '22:45', landmark: 'NH-44 Exit' },
        ],
        droppingPoints: [
          { name: 'Hebbal Flyover', time: '06:00', landmark: 'Esteem Mall' },
          { name: 'Kempegowda Bus Station (Majestic)', time: '06:45', landmark: 'Terminal 1' },
        ],
      },
      {
        origin: 'Delhi',
        source: 'Delhi',
        destination: 'Agra',
        departurePoint: 'Sarai Kale Khan ISBT',
        arrivalPoint: 'Idgah Bus Stand Agra',
        distanceKm: 210,
        estimatedDuration: '3h 45m',
        durationMinutes: 225,
        highwayNumber: 'Yamuna Exp',
        baseFare: 380,
        boardingPoints: [
          { name: 'Sarai Kale Khan ISBT', time: '07:30', landmark: 'Hazrat Nizamuddin Station' },
          { name: 'Noida Zero Point Expressway', time: '08:15', landmark: 'Greater Noida Toll' },
        ],
        droppingPoints: [
          { name: 'Agra Fort Bus Stand', time: '11:00', landmark: 'Opposite Fort Gate' },
          { name: 'Idgah Central Bus Terminal', time: '11:15', landmark: 'Main Stand' },
        ],
      },
    ]);

    // 4. Create Buses with full seatLayouts
    logger.info('Creating master buses with physical seat layouts...');
    const buses = await Bus.create([
      {
        busNumber: 'WB-01-1234',
        busName: 'YatraBus Express',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'AC Seater (2+2)',
        origin: 'Kolkata',
        destination: 'Digha',
        departureTime: '07:00',
        arrivalTime: '11:15',
        journeyDuration: '4h 15m',
        fare: 350,
        totalSeats: 40,
        availableSeatsCount: 39,
        deckType: 'single',
        rating: 4.7,
        reviewsCount: 180,
        hasLiveTracking: true,
        boardingPoints: routes[0].boardingPoints,
        droppingPoints: routes[0].droppingPoints,
      },
      {
        busNumber: 'WB-04-E-5678',
        busName: 'YatraBus Platinum Sleeper',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'AC Sleeper (2+1)',
        origin: 'Kolkata',
        destination: 'Siliguri',
        departureTime: '20:00',
        arrivalTime: '06:30',
        journeyDuration: '10h 30m',
        fare: 1150,
        totalSeats: 36,
        availableSeatsCount: 34,
        deckType: 'double',
        rating: 4.8,
        reviewsCount: 342,
        hasLiveTracking: true,
        boardingPoints: routes[1].boardingPoints,
        droppingPoints: routes[1].droppingPoints,
      },
      {
        busNumber: 'WB-02-B-9911',
        busName: 'YatraBus Volvo Coach',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'Multi-Axle AC Seater (2+2)',
        origin: 'Kolkata',
        destination: 'Siliguri',
        departureTime: '21:30',
        arrivalTime: '08:00',
        journeyDuration: '10h 30m',
        fare: 890,
        totalSeats: 40,
        availableSeatsCount: 40,
        deckType: 'single',
        rating: 4.6,
        reviewsCount: 289,
        hasLiveTracking: true,
        boardingPoints: routes[1].boardingPoints,
        droppingPoints: routes[1].droppingPoints,
      },
      {
        busNumber: 'DL-01-TC-4400',
        busName: 'YatraBus Premium Sleeper',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'AC Sleeper (2+1)',
        origin: 'Delhi',
        destination: 'Jaipur',
        departureTime: '06:30',
        arrivalTime: '11:45',
        journeyDuration: '5h 15m',
        fare: 650,
        totalSeats: 36,
        availableSeatsCount: 35,
        deckType: 'double',
        rating: 4.9,
        reviewsCount: 512,
        hasLiveTracking: true,
        boardingPoints: routes[2].boardingPoints,
        droppingPoints: routes[2].droppingPoints,
      },
      {
        busNumber: 'MH-12-RN-7788',
        busName: 'YatraBus Multi-Axle Coach',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'AC Sleeper (2+1)',
        origin: 'Mumbai',
        destination: 'Pune',
        departureTime: '07:00',
        arrivalTime: '10:30',
        journeyDuration: '3h 30m',
        fare: 450,
        totalSeats: 36,
        availableSeatsCount: 34,
        deckType: 'double',
        rating: 4.7,
        reviewsCount: 420,
        hasLiveTracking: true,
        boardingPoints: routes[3].boardingPoints,
        droppingPoints: routes[3].droppingPoints,
      },
      {
        busNumber: 'KA-01-F-1100',
        busName: 'YatraBus Diamond Sleeper',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'AC Sleeper (2+1)',
        origin: 'Bengaluru',
        destination: 'Chennai',
        departureTime: '23:00',
        arrivalTime: '05:30',
        journeyDuration: '6h 30m',
        fare: 799,
        totalSeats: 36,
        availableSeatsCount: 35,
        deckType: 'double',
        rating: 4.5,
        reviewsCount: 310,
        hasLiveTracking: true,
        boardingPoints: routes[4].boardingPoints,
        droppingPoints: routes[4].droppingPoints,
      },
      {
        busNumber: 'TS-09-UB-3344',
        busName: 'YatraBus Royal Cruiser',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'AC Sleeper (2+1)',
        origin: 'Hyderabad',
        destination: 'Bengaluru',
        departureTime: '21:30',
        arrivalTime: '06:45',
        journeyDuration: '9h 15m',
        fare: 950,
        totalSeats: 36,
        availableSeatsCount: 35,
        deckType: 'double',
        rating: 4.8,
        reviewsCount: 220,
        hasLiveTracking: true,
        boardingPoints: routes[6].boardingPoints,
        droppingPoints: routes[6].droppingPoints,
      },
      {
        busNumber: 'UP-80-BT-2211',
        busName: 'YatraBus Taj Express',
        operator: 'YatraBus',
        operatorId: operator._id,
        busType: 'AC Seater (2+2)',
        origin: 'Delhi',
        destination: 'Agra',
        departureTime: '07:30',
        arrivalTime: '11:15',
        journeyDuration: '3h 45m',
        fare: 380,
        totalSeats: 40,
        availableSeatsCount: 39,
        deckType: 'single',
        rating: 4.6,
        reviewsCount: 195,
        hasLiveTracking: true,
        boardingPoints: routes[7].boardingPoints,
        droppingPoints: routes[7].droppingPoints,
      },
    ]);

    // 5. Create Multi-Tier Pricing Rules
    logger.info('Creating multi-tier pricing rules with weekend and seat-type multipliers...');
    for (const bus of buses) {
      await Pricing.create({
        busId: bus._id,
        seatType: 'seater',
        basePrice: bus.fare,
        additionalCharges: 0,
        taxPercent: 5,
        dayOfWeekMultiplier: 1.0,
        weekendMultiplier: 1.2,
        festiveMultiplier: 1.25,
        lastMinuteMultiplier: 1.15,
        sleeperMultiplier: 1.2,
        lowerBerthMultiplier: 1.1,
        frontRowMultiplier: 1.05,
      });
      if (bus.deckType === 'double') {
        await Pricing.create({
          busId: bus._id,
          seatType: 'sleeper',
          basePrice: bus.fare + 100,
          additionalCharges: 50,
          taxPercent: 5,
          dayOfWeekMultiplier: 1.0,
          weekendMultiplier: 1.25,
          festiveMultiplier: 1.3,
          lastMinuteMultiplier: 1.2,
          sleeperMultiplier: 1.2,
          lowerBerthMultiplier: 1.1,
          frontRowMultiplier: 1.05,
        });
      }
    }

    // 6. Create Scheduled Trips (Today, Tomorrow, Nov 20, 21, 22, 2026)
    logger.info('Scheduling trips across active dates...');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrowDate = new Date(now.getTime() + 86400000);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];
    const dayAfterDate = new Date(now.getTime() + 2 * 86400000);
    const dayAfter = dayAfterDate.toISOString().split('T')[0];

    const targetDates = [today, tomorrow, dayAfter, '2026-11-20', '2026-11-21', '2026-11-22'];

    const createdTrips = [];
    for (const date of targetDates) {
      // Kolkata -> Digha (WB-01-1234, Route 0)
      const tripDigha = await Trip.create({
        busId: buses[0]._id,
        routeId: routes[0]._id,
        travelDate: date,
        departureTime: '07:00',
        arrivalTime: '11:15',
        boardingPoints: routes[0].boardingPoints,
        droppingPoints: routes[0].droppingPoints,
        status: 'scheduled',
        baseFare: 350,
      });
      createdTrips.push(tripDigha);

      // Kolkata -> Siliguri (WB-04-E-5678, Route 1)
      const tripSiliguri1 = await Trip.create({
        busId: buses[1]._id,
        routeId: routes[1]._id,
        travelDate: date,
        departureTime: '20:00',
        arrivalTime: '06:30',
        boardingPoints: routes[1].boardingPoints,
        droppingPoints: routes[1].droppingPoints,
        status: 'scheduled',
        baseFare: 1150,
      });
      createdTrips.push(tripSiliguri1);

      // Delhi -> Jaipur (DL-01-TC-4400, Route 2)
      const tripJaipur = await Trip.create({
        busId: buses[3]._id,
        routeId: routes[2]._id,
        travelDate: date,
        departureTime: '06:30',
        arrivalTime: '11:45',
        boardingPoints: routes[2].boardingPoints,
        droppingPoints: routes[2].droppingPoints,
        status: 'scheduled',
        baseFare: 650,
      });
      createdTrips.push(tripJaipur);

      // Mumbai -> Pune (MH-12-RN-7788, Route 3)
      const tripPune = await Trip.create({
        busId: buses[4]._id,
        routeId: routes[3]._id,
        travelDate: date,
        departureTime: '07:00',
        arrivalTime: '10:30',
        boardingPoints: routes[3].boardingPoints,
        droppingPoints: routes[3].droppingPoints,
        status: 'scheduled',
        baseFare: 450,
      });
      createdTrips.push(tripPune);

      // Bengaluru -> Chennai (KA-01-F-1100, Route 4)
      const tripChennai = await Trip.create({
        busId: buses[5]._id,
        routeId: routes[4]._id,
        travelDate: date,
        departureTime: '23:00',
        arrivalTime: '05:30',
        boardingPoints: routes[4].boardingPoints,
        droppingPoints: routes[4].droppingPoints,
        status: 'scheduled',
        baseFare: 799,
      });
      createdTrips.push(tripChennai);

      // Hyderabad -> Bengaluru (TS-09-UB-3344, Route 6)
      const tripHydBlr = await Trip.create({
        busId: buses[6]._id,
        routeId: routes[6]._id,
        travelDate: date,
        departureTime: '21:30',
        arrivalTime: '06:45',
        boardingPoints: routes[6].boardingPoints,
        droppingPoints: routes[6].droppingPoints,
        status: 'scheduled',
        baseFare: 950,
      });
      createdTrips.push(tripHydBlr);

      // Delhi -> Agra (UP-80-BT-2211, Route 7)
      const tripAgra = await Trip.create({
        busId: buses[7]._id,
        routeId: routes[7]._id,
        travelDate: date,
        departureTime: '07:30',
        arrivalTime: '11:15',
        boardingPoints: routes[7].boardingPoints,
        droppingPoints: routes[7].droppingPoints,
        status: 'scheduled',
        baseFare: 380,
      });
      createdTrips.push(tripAgra);
    }

    // 7. Seed Specific Bookings, SeatReservations, Payments, Tickets

    // Helper to create complete booking record
    const createFullBooking = async ({
      user,
      trip,
      bus,
      route,
      seats,
      passengers,
      bookingStatus = 'confirmed',
      paymentStatus = 'paid',
      paymentMethod = 'UPI',
      pnr,
      totalFare,
      baseFare,
      additionalCharges = 0,
      taxAmount,
    }) => {
      const booking = await Booking.create({
        bookingReference: pnr,
        pnr,
        userId: user._id,
        tripId: trip._id,
        busId: bus._id,
        busName: bus.busName,
        operator: bus.operator,
        busNumber: bus.busNumber,
        busType: bus.busType,
        origin: route.source || route.origin,
        destination: route.destination,
        journeyDate: trip.travelDate,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        boardingPoint: trip.boardingPoints?.[0]?.name || 'Main Stand',
        droppingPoint: trip.droppingPoints?.[0]?.name || 'City Drop',
        seats,
        passengers,
        priceBreakdown: {
          basePrice: baseFare,
          additionalCharges,
          taxAmount,
          totalAmount: totalFare,
        },
        totalFare,
        bookingStatus,
        paymentStatus,
        paymentMethod,
        contactEmail: user.email,
        contactPhone: user.phone,
      });

      // Create SeatReservations
      for (const seatNo of seats) {
        await SeatReservation.create({
          tripId: trip._id,
          busId: bus._id,
          travelDate: trip.travelDate,
          seatNumber: seatNo,
          bookingId: booking._id,
          userId: user._id,
          status: bookingStatus === 'confirmed' ? 'booked' : 'locked',
          lockExpiresAt: bookingStatus === 'confirmed' ? null : new Date(Date.now() + 10 * 60 * 1000),
        });
      }

      // Create Payment
      const payment = await Payment.create({
        bookingId: booking._id,
        userId: user._id,
        amount: totalFare,
        currency: 'INR',
        gateway: 'Mock',
        gatewayOrderId: `order_${pnr.toLowerCase()}`,
        gatewayPaymentId: `pay_${pnr.toLowerCase()}`,
        transactionReference: `TXN-${pnr}`,
        paymentMethod,
        status: paymentStatus === 'paid' ? 'successful' : 'pending',
      });

      // Create Ticket if confirmed
      let ticket = null;
      if (bookingStatus === 'confirmed') {
        ticket = await Ticket.create({
          bookingId: booking._id,
          pnr,
          journeySnapshot: {
            busName: bus.busName,
            busNumber: bus.busNumber,
            busType: bus.busType,
            source: route.source || route.origin,
            destination: route.destination,
            travelDate: trip.travelDate,
            departureTime: trip.departureTime,
            arrivalTime: trip.arrivalTime,
            boardingPoint: trip.boardingPoints?.[0]?.name || 'Main Stand',
            droppingPoint: trip.droppingPoints?.[0]?.name || 'City Drop',
            duration: route.estimatedDuration,
          },
          passengerSnapshot: passengers,
          seats,
          priceBreakdown: {
            basePrice: baseFare,
            additionalCharges,
            taxAmount,
            totalAmount: totalFare,
          },
          paymentStatus: 'Successful',
        });
      }

      return { booking, payment, ticket };
    };

    logger.info('Creating SRS verified scenario: Bus WB-01-1234 Kolkata->Digha on 20 Nov 2026, Seat S1 booked by Customer A...');
    // Target trip: Kolkata to Digha on 2026-11-20
    const tripDighaNov20 = createdTrips.find(
      (t) => t.travelDate === '2026-11-20' && t.busId.toString() === buses[0]._id.toString()
    );

    // Booking 1: SRS Requirement Section 7.1 & 7.2
    // Customer A (Rahul Sen) books seat S1 (Seat A1 equivalent) on Kolkata to Digha, 20 Nov 2026
    await createFullBooking({
      user: user1,
      trip: tripDighaNov20,
      bus: buses[0],
      route: routes[0],
      seats: ['S1'],
      passengers: [{ name: 'Rahul Sen', age: 26, gender: 'male', seatNumber: 'S1', contact: '9876543210', email: 'rahul@yatra.com' }],
      pnr: 'BK-DIGHA20A',
      baseFare: 350,
      taxAmount: 18,
      totalFare: 368,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'UPI',
    });

    // Booking 2: Priya Sharma books Kolkata to Siliguri on 20 Nov 2026, seats L1, L4
    const tripSiliguriNov20 = createdTrips.find(
      (t) => t.travelDate === '2026-11-20' && t.busId.toString() === buses[1]._id.toString()
    );
    await createFullBooking({
      user: user2,
      trip: tripSiliguriNov20,
      bus: buses[1],
      route: routes[1],
      seats: ['L1', 'L4'],
      passengers: [
        { name: 'Priya Sharma', age: 24, gender: 'female', seatNumber: 'L1', contact: '9812345678', email: 'priya@yatra.com' },
        { name: 'Ritu Sharma', age: 22, gender: 'female', seatNumber: 'L4', contact: '9812345678', email: 'priya@yatra.com' },
      ],
      pnr: 'BK-SILIGURI20',
      baseFare: 2500,
      additionalCharges: 100,
      taxAmount: 130,
      totalFare: 2730,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
    });

    // Booking 3: Amit Patel books Delhi to Jaipur for today, seat L2
    const tripJaipurToday = createdTrips.find(
      (t) => t.travelDate === today && t.busId.toString() === buses[3]._id.toString()
    );
    await createFullBooking({
      user: user3,
      trip: tripJaipurToday,
      bus: buses[3],
      route: routes[2],
      seats: ['L2'],
      passengers: [{ name: 'Amit Patel', age: 31, gender: 'male', seatNumber: 'L2', contact: '9823456789', email: 'amit@yatra.com' }],
      pnr: 'BK-JAIPURTODAY',
      baseFare: 750,
      additionalCharges: 50,
      taxAmount: 40,
      totalFare: 840,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Net Banking',
    });

    // Booking 4: Sneha Roy books Mumbai to Pune for tomorrow, seats L5, L6
    const tripPuneTomorrow = createdTrips.find(
      (t) => t.travelDate === tomorrow && t.busId.toString() === buses[4]._id.toString()
    );
    await createFullBooking({
      user: user4,
      trip: tripPuneTomorrow,
      bus: buses[4],
      route: routes[3],
      seats: ['L5', 'L6'],
      passengers: [
        { name: 'Sneha Roy', age: 28, gender: 'female', seatNumber: 'L5', contact: '9834567890', email: 'sneha@yatra.com' },
        { name: 'Kavita Roy', age: 52, gender: 'female', seatNumber: 'L6', contact: '9834567890', email: 'sneha@yatra.com' },
      ],
      pnr: 'BK-PUNETMRW',
      baseFare: 1100,
      additionalCharges: 100,
      taxAmount: 60,
      totalFare: 1260,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'UPI',
    });

    // Booking 5: Arjun Nair books Bengaluru to Chennai for day after tomorrow, seat U1
    const tripChennaiDayAfter = createdTrips.find(
      (t) => t.travelDate === dayAfter && t.busId.toString() === buses[5]._id.toString()
    );
    await createFullBooking({
      user: user5,
      trip: tripChennaiDayAfter,
      bus: buses[5],
      route: routes[4],
      seats: ['U1'],
      passengers: [{ name: 'Arjun Nair', age: 29, gender: 'male', seatNumber: 'U1', contact: '9845678901', email: 'arjun@yatra.com' }],
      pnr: 'BK-CHENNAIDAY',
      baseFare: 899,
      additionalCharges: 50,
      taxAmount: 47,
      totalFare: 996,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'UPI',
    });

    // Booking 6: Pending Booking (User Rahul Sen on Delhi to Agra on 20 Nov 2026, seat S5)
    const tripAgraNov20 = createdTrips.find(
      (t) => t.travelDate === '2026-11-20' && t.busId.toString() === buses[7]._id.toString()
    );
    await createFullBooking({
      user: user1,
      trip: tripAgraNov20,
      bus: buses[7],
      route: routes[7],
      seats: ['S5'],
      passengers: [{ name: 'Rahul Sen', age: 26, gender: 'male', seatNumber: 'S5', contact: '9876543210', email: 'rahul@yatra.com' }],
      pnr: 'BK-AGRAPEND',
      baseFare: 380,
      taxAmount: 19,
      totalFare: 399,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'UPI',
    });

    // Booking 7: Cancelled Booking with Refund record and Cancellation log
    const tripHydBlrTomorrow = createdTrips.find(
      (t) => t.travelDate === tomorrow && t.busId.toString() === buses[6]._id.toString()
    );
    const cancelledBooking = await Booking.create({
      bookingReference: 'BK-CANCHYD01',
      pnr: 'BK-CANCHYD01',
      userId: user2._id,
      tripId: tripHydBlrTomorrow._id,
      busId: buses[6]._id,
      busName: buses[6].busName,
      operator: buses[6].operator,
      busNumber: buses[6].busNumber,
      busType: buses[6].busType,
      origin: routes[6].source,
      destination: routes[6].destination,
      journeyDate: tripHydBlrTomorrow.travelDate,
      departureTime: tripHydBlrTomorrow.departureTime,
      arrivalTime: tripHydBlrTomorrow.arrivalTime,
      boardingPoint: 'MGBS CBS Hyderabad',
      droppingPoint: 'Kempegowda Bus Station (Majestic)',
      seats: ['L3'],
      passengers: [{ name: 'Priya Sharma', age: 24, gender: 'female', seatNumber: 'L3', contact: '9812345678', email: 'priya@yatra.com' }],
      priceBreakdown: { basePrice: 1050, additionalCharges: 50, taxAmount: 55, totalAmount: 1155 },
      totalFare: 1155,
      bookingStatus: 'cancelled',
      paymentStatus: 'refunded',
      paymentMethod: 'UPI',
      contactEmail: user2.email,
      contactPhone: user2.phone,
    });

    await Payment.create({
      bookingId: cancelledBooking._id,
      userId: user2._id,
      amount: 1155,
      currency: 'INR',
      gateway: 'Mock',
      gatewayOrderId: 'order_canc_hyd01',
      gatewayPaymentId: 'pay_canc_hyd01',
      transactionReference: 'TXN-BK-CANCHYD01',
      paymentMethod: 'UPI',
      status: 'refunded',
      refundStatus: 'Processed',
    });

    await Cancellation.create({
      bookingId: cancelledBooking._id,
      userId: user2._id,
      bookingReference: 'BK-CANCHYD01',
      reason: 'Change in personal travel schedule',
      refundAmount: 1155,
      refundStatus: 'processed',
    });

    // 8. Create Drivers
    logger.info('Creating fleet drivers...');
    await Driver.create([
      {
        name: 'Rajesh Kumar Verma',
        phone: '9876501122',
        licenseNumber: 'WB-01-DL-2015-8899',
        experienceYears: 12,
        busId: buses[0]._id,
        status: 'Available',
        rating: 4.8,
        tripsCompleted: 340,
      },
      {
        name: 'Mohammad Shamim',
        phone: '9876502233',
        licenseNumber: 'WB-02-DL-2012-4411',
        experienceYears: 14,
        busId: buses[1]._id,
        status: 'Available',
        rating: 4.6,
        tripsCompleted: 420,
      },
      {
        name: 'Sukhvinder Singh',
        phone: '9876503344',
        licenseNumber: 'DL-01-DL-2010-9900',
        experienceYears: 16,
        busId: buses[3]._id,
        status: 'Available',
        rating: 4.9,
        tripsCompleted: 580,
      },
      {
        name: 'Ganesh Patil',
        phone: '9876504455',
        licenseNumber: 'MH-12-DL-2016-1122',
        experienceYears: 9,
        busId: buses[4]._id,
        status: 'Available',
        rating: 4.7,
        tripsCompleted: 290,
      },
    ]);

    // 9. Create Staff
    logger.info('Creating staff members...');
    await Staff.create([
      { name: 'Sunil Sen', email: 'sunil.kolkata@yatrabus.in', phone: '9811001100', role: 'Terminal Manager', branch: 'Kolkata Central' },
      { name: 'Manish Rawat', email: 'manish.delhi@yatrabus.in', phone: '9811002200', role: 'Fleet Supervisor', branch: 'Delhi ISBT' },
      { name: 'Deepak Deshmukh', email: 'deepak.mumbai@yatrabus.in', phone: '9811003300', role: 'Operations Lead', branch: 'Mumbai Borivali' },
      { name: 'Kavitha R', email: 'kavitha.blr@yatrabus.in', phone: '9811004400', role: 'Customer Service Lead', branch: 'Bengaluru Majestic' },
    ]);

    // 10. Create Offers / Coupons (Idempotent upsert)
    logger.info('Creating promo codes & offers...');
    const SEED_OFFERS = [
      {
        code: 'YATRAFIRST',
        title: 'Flat 15% OFF for First Time Passengers',
        description: 'Get instant 15% discount up to ₹200 on your first booking with YatraBus.',
        discountType: 'percent',
        value: 15,
        discountPercentage: 15,
        maxDiscount: 200,
        minAmount: 500,
        minBookingAmount: 500,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        expiryDate: '2026-12-31',
        usageLimit: 1000,
        usedCount: 48,
        usageCount: 48,
        applicableRoutes: [],
        isActive: true,
        status: 'Active',
        badge: 'FLAT 15% OFF',
        tag: 'FIRST RIDE',
        img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        bgGradient: 'from-purple-900 to-indigo-900',
      },
      {
        code: 'FESTIVE50',
        title: 'Special ₹50 OFF Festive Travel',
        description: 'Flat ₹50 savings across all festival season bus routes nationwide.',
        discountType: 'flat',
        value: 50,
        discountPercentage: 0,
        maxDiscount: 50,
        minAmount: 400,
        minBookingAmount: 400,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        expiryDate: '2026-12-31',
        usageLimit: 500,
        usedCount: 112,
        usageCount: 112,
        applicableRoutes: [],
        isActive: true,
        status: 'Active',
        badge: 'FLAT ₹50 OFF',
        tag: 'FESTIVAL SPECIAL',
        img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
        bgGradient: 'from-blue-900 to-cyan-900',
      },
      {
        code: 'DIGHA100',
        title: 'Flat ₹100 OFF on Kolkata-Digha Express',
        description: 'Save ₹100 on every seat booked along the Kolkata to Digha coastal corridor.',
        discountType: 'flat',
        value: 100,
        discountPercentage: 0,
        maxDiscount: 100,
        minAmount: 300,
        minBookingAmount: 300,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        expiryDate: '2026-12-31',
        usageLimit: 300,
        usedCount: 42,
        usageCount: 42,
        applicableRoutes: ['Kolkata-Digha', 'Kolkata to Digha'],
        isActive: true,
        status: 'Active',
        badge: 'FLAT ₹100 OFF',
        tag: 'BEACH ESCAPE',
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        bgGradient: 'from-teal-900 to-emerald-900',
      },
      {
        code: 'JAIPUR15',
        title: '15% OFF on Delhi-Jaipur Highway Express',
        description: 'Enjoy 15% off up to ₹150 for your Pink City weekend heritage getaway.',
        discountType: 'percent',
        value: 15,
        discountPercentage: 15,
        maxDiscount: 150,
        minAmount: 500,
        minBookingAmount: 500,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        expiryDate: '2026-12-31',
        usageLimit: 400,
        usedCount: 75,
        usageCount: 75,
        applicableRoutes: ['Delhi-Jaipur', 'Delhi to Jaipur'],
        isActive: true,
        status: 'Active',
        badge: '15% OFF',
        tag: 'HERITAGE ROUTE',
        img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
        bgGradient: 'from-pink-900 to-rose-900',
      },
      {
        code: 'WEEKEND20',
        title: 'Weekend Getaway 20% Discount',
        description: 'Get 20% discount up to ₹250 on premium AC and sleeper weekend departures.',
        discountType: 'percent',
        value: 20,
        discountPercentage: 20,
        maxDiscount: 250,
        minAmount: 600,
        minBookingAmount: 600,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        expiryDate: '2026-12-31',
        usageLimit: 600,
        usedCount: 89,
        usageCount: 89,
        applicableRoutes: [],
        isActive: true,
        status: 'Active',
        badge: '20% OFF',
        tag: 'WEEKEND SAVER',
        img: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
        bgGradient: 'from-amber-900 to-orange-900',
      },
      {
        code: 'UPIBANK75',
        title: 'Flat ₹75 Cashback with Instant UPI & RuPay',
        description: 'Flat ₹75 instant savings when paying via UPI VPA or RuPay debit cards.',
        discountType: 'flat',
        value: 75,
        discountPercentage: 0,
        maxDiscount: 75,
        minAmount: 500,
        minBookingAmount: 500,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        expiryDate: '2026-12-31',
        usageLimit: 1500,
        usedCount: 320,
        usageCount: 320,
        applicableRoutes: [],
        isActive: true,
        status: 'Active',
        badge: 'FLAT ₹75 OFF',
        tag: 'BANK OFFER',
        img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
        bgGradient: 'from-violet-900 to-purple-900',
      },
      {
        code: 'EXPIRED30',
        title: 'Monsoon Saver 30% OFF',
        description: 'Past seasonal discount offer for monsoon travel corridors (expired test voucher).',
        discountType: 'percent',
        value: 30,
        discountPercentage: 30,
        maxDiscount: 300,
        minAmount: 400,
        minBookingAmount: 400,
        validFrom: '2025-06-01',
        validTo: '2025-08-31',
        expiryDate: '2025-08-31',
        usageLimit: 200,
        usedCount: 200,
        usageCount: 200,
        applicableRoutes: [],
        isActive: true,
        status: 'Expired',
        badge: '30% EXPIRED',
        tag: 'EXPIRED TEST',
        img: '',
        bgGradient: '',
      },
      {
        code: 'INACTIVE10',
        title: 'Early Bird 10% OFF',
        description: 'Deactivated promotional voucher code for system testing.',
        discountType: 'percent',
        value: 10,
        discountPercentage: 10,
        maxDiscount: 100,
        minAmount: 300,
        minBookingAmount: 300,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        expiryDate: '2026-12-31',
        usageLimit: 100,
        usedCount: 0,
        usageCount: 0,
        applicableRoutes: [],
        isActive: false,
        status: 'Disabled',
        badge: 'INACTIVE',
        tag: 'INACTIVE TEST',
        img: '',
        bgGradient: '',
      },
    ];

    for (const off of SEED_OFFERS) {
      await Offer.findOneAndUpdate(
        { code: off.code },
        { $set: off },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // 11. Create Notifications
    logger.info('Creating admin notifications...');
    await AdminNotification.create([
      {
        title: 'Seat A1 Reserved on Kolkata-Digha',
        message: 'Customer Rahul Sen confirmed reservation for seat S1 on trip 20 Nov 2026.',
        category: 'booking',
        read: false,
      },
      {
        title: 'Gateway Settlement Reconciled',
        message: 'All daily UPI and Card transactions have been verified and settled.',
        category: 'payment',
        read: false,
      },
      {
        title: 'Self-Cancellation Refund Processed',
        message: 'Refund of ₹1,155 for PNR BK-CANCHYD01 processed to original payment method.',
        category: 'cancellation',
        read: true,
      },
      {
        title: 'Fleet Inspection Due',
        message: 'Bus WB-04-E-5678 is scheduled for scheduled maintenance inspection next week.',
        category: 'alert',
        read: false,
      },
    ]);

    // 12. Create Saved Passengers & Travel Journal
    logger.info('Creating saved passengers and journal entries...');
    await SavedPassenger.create([
      { userId: user1._id, name: 'Rahul Sen', age: 26, gender: 'male', phone: '9876543210', berthPreference: 'lower' },
      { userId: user1._id, name: 'Priya Sen', age: 24, gender: 'female', phone: '9876543211', berthPreference: 'lower' },
      { userId: user1._id, name: 'Animesh Sen', age: 58, gender: 'male', phone: '9876543212', berthPreference: 'lower' },
    ]);

    await JournalEntry.create([
      {
        userId: user1._id,
        title: 'Sunset over Digha Beach',
        location: 'Digha, West Bengal',
        story: 'Arrived on the YatraBus morning express from Esplanade. The roar of the Bay of Bengal waves and gentle coastal breeze made for an unforgettable weekend escape.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
        prints: [
          {
            src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
            caption: 'Old Digha Sea Wall',
            x: 14,
            y: 20,
            w: 26,
            rotate: -3,
            tape: true,
          },
        ],
        notes: [
          {
            x: 54,
            y: 16,
            w: 36,
            title: 'Coastal Reflections',
            body: 'Esplanade to Digha in just 4 hours on WB-01-1234. Smooth roads and clean reclining seats made all the difference.',
            rotate: 1,
            style: 'card',
          },
        ],
      },
      {
        userId: user1._id,
        title: 'Misty Dawn at Siliguri Foothills',
        location: 'Siliguri, West Bengal',
        story: 'Woke up as our YatraBus Diamond Sleeper entered the tea gardens of North Bengal. Fresh mountain air and panoramic sights towards the hills.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80',
        prints: [
          {
            src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            caption: 'Tea Gardens of Terai',
            x: 12,
            y: 22,
            w: 28,
            rotate: 2,
            tape: true,
          },
        ],
        notes: [
          {
            x: 52,
            y: 18,
            w: 38,
            title: 'Gateway to the North East',
            body: 'Super comfy overnight sleeper bus journey. Arrived well-rested and on schedule at Tenzing Norgay bus terminal.',
            rotate: -1,
            style: 'card',
          },
        ],
      },
    ]);

    // 13. Create Realistic Authentic Indian Destinations
    logger.info('Creating authentic Indian destination directory...');
    await Destination.create([
      {
        name: 'Varanasi',
        state: 'Uttar Pradesh',
        tag: 'Spiritual',
        title: 'The Eternal Spiritual Capital on the Sacred Ganga',
        description: 'Experience ancient evening Ganga aartis, labyrinthine heritage alleys, and tranquil dawn boat rides along legendary ghats.',
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
        highlights: ['Dashashwamedh Ghat Aarti', 'Kashi Vishwanath Corridor', 'Sarnath Buddhist Stupa', 'Assi Ghat Morning Ragas'],
        popularPickups: ['Delhi', 'Kolkata', 'Patna', 'Lucknow'],
        startingFare: 650,
        isActive: true,
      },
      {
        name: 'Jaipur',
        state: 'Rajasthan',
        tag: 'Heritage',
        title: 'The Historic Pink City of Forts and Royal Palaces',
        description: 'Explore the majestic Amber Fort, the terracotta façade of Hawa Mahal, bustling Johari Bazaar, and authentic Rajasthani hospitality.',
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
        highlights: ['Amber Palace & Fort', 'Hawa Mahal Palace of Winds', 'City Palace', 'Nahargarh Fort Sunset'],
        popularPickups: ['Delhi', 'Gurugram', 'Agra', 'Ahmedabad'],
        startingFare: 550,
        isActive: true,
      },
      {
        name: 'Manali',
        state: 'Himachal Pradesh',
        tag: 'Hill Station',
        title: 'Snow-Capped Himalayan Vistas & Cedar Forest Valleys',
        description: 'Nestled on the banks of Beas river, Manali offers adventure sports in Solang Valley, pine-scented Old Manali cafes, and Atal Tunnel views.',
        image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
        highlights: ['Solang Valley Snow Point', 'Hadimba Devi Temple', 'Rohtang Pass Viewpoint', 'Jogini Waterfall Trek'],
        popularPickups: ['Delhi', 'Chandigarh', 'Shimla'],
        startingFare: 1350,
        isActive: true,
      },
      {
        name: 'Digha',
        state: 'West Bengal',
        tag: 'Beach',
        title: 'Bengal Premier Coastal Retreat along the Bay of Bengal',
        description: 'Famed for wide flat beaches, scenic casuarina groves, fresh coastal seafood markets, and gentle surf perfect for seaside relaxation.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        highlights: ['New Digha Sea Beach', 'Marine Aquarium & Research Centre', 'Udaipur Beach Border Walk', 'Lord Shiva Chandaneswar Temple'],
        popularPickups: ['Kolkata', 'Howrah', 'Kharagpur'],
        startingFare: 350,
        isActive: true,
      },
      {
        name: 'Darjeeling',
        state: 'West Bengal',
        tag: 'Hill Station',
        title: 'The Queen of Hills with Majestic Kanchenjunga Vistas',
        description: 'Emerald hillside tea estates, the UNESCO Himalayan Railway, Tiger Hill sunrise over Mount Kanchenjunga, and vibrant colonial-era architecture.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
        highlights: ['Tiger Hill Sunrise', 'Batasia Loop Railway', 'Happy Valley Tea Estate', 'Himalayan Mountaineering Institute'],
        popularPickups: ['Siliguri', 'Kolkata'],
        startingFare: 890,
        isActive: true,
      },
      {
        name: 'Agra',
        state: 'Uttar Pradesh',
        tag: 'Heritage',
        title: 'City of the Immortal Taj Mahal & Mughal Splendour',
        description: 'Stand before the white marble wonder of the world, visit the grand ramparts of Agra Fort, and stroll the courtyards of Fatehpur Sikri.',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
        highlights: ['Taj Mahal Wonder of the World', 'Agra Red Fort', 'Mehtab Bagh Yamuna Sunset', 'Fatehpur Sikri Imperial Complex'],
        popularPickups: ['Delhi', 'Jaipur', 'Lucknow'],
        startingFare: 450,
        isActive: true,
      },
      {
        name: 'Puri',
        state: 'Odisha',
        tag: 'Pilgrimage',
        title: 'Sacred Coastal Haven of Lord Jagannath',
        description: 'One of the Char Dham pilgrimage sites, renowned for the sacred Jagannath Temple, golden surf beaches, and magnificent sand art.',
        image: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?auto=format&fit=crop&w=1000&q=80',
        highlights: ['Jagannath Temple Darshan', 'Golden Sand Sea Beach', 'Konark Sun Temple Excursion', 'Chilika Lake Dolphin Sanctuary'],
        popularPickups: ['Kolkata', 'Bhubaneswar', 'Visakhapatnam'],
        startingFare: 750,
        isActive: true,
      },
      {
        name: 'Goa',
        state: 'Goa',
        tag: 'Beach',
        title: 'Sun-Drenched Coastal Paradise & Portuguese Heritage',
        description: 'Palm-fringed golden shorelines, whitewashed colonial churches, vibrant beach shacks, and scenic Western Ghats river cruises.',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
        highlights: ['Palolem & Baga Beaches', 'Basilica of Bom Jesus', 'Dudhsagar Waterfalls', 'Fort Aguada Coastal Bastion'],
        popularPickups: ['Mumbai', 'Pune', 'Bengaluru', 'Hyderabad'],
        startingFare: 850,
        isActive: true,
      },
    ]);

    // 14. Create Short Trips & Weekend Circuits (TripPackages)
    logger.info('Creating authentic Indian short-trip packages...');
    await TripPackage.create([
      {
        title: 'Mahabaleshwar - Ganpatipule Scenic Coastal Circuit',
        slug: 'pune-mahabaleshwar-ganpatipule',
        category: 'Konkan',
        durationDays: 3,
        durationNights: 2,
        packageType: 'Coastal Route',
        pricePerPerson: 4550,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Pune ➔ Mahabaleshwar ➔ Ganpatipule',
        departureCity: 'Pune',
        destinationCity: 'Ganpatipule',
        featured: true,
        itinerary: [
          { day: 1, title: 'Pune to Mahabaleshwar', description: 'Scenic Western Ghats drive, visit strawberry farms and Arthur Seat viewpoint.', meals: ['Breakfast', 'Dinner'] },
          { day: 2, title: 'Mahabaleshwar to Ganpatipule', description: 'Konkan ghat descent, Prachin Konkan museum and sunset beach stroll.', meals: ['Breakfast', 'Dinner'] },
          { day: 3, title: 'Ganpatipule to Pune', description: 'Morning Swayambhu Ganesh Mandir darshan and return journey.', meals: ['Breakfast'] },
        ],
      },
      {
        title: 'Haridwar & Rishikesh Divine Ganga Circuit',
        slug: 'delhi-rishikesh-haridwar',
        category: 'Pilgrim',
        durationDays: 2,
        durationNights: 1,
        packageType: 'Jyotirlinga Tour',
        pricePerPerson: 3450,
        image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Delhi ➔ Haridwar ➔ Rishikesh',
        departureCity: 'Delhi',
        destinationCity: 'Rishikesh',
        featured: true,
        itinerary: [
          { day: 1, title: 'Delhi to Haridwar', description: 'Early morning AC coach departure, check-in, visit Mansa Devi Temple and evening Har Ki Pauri Ganga Aarti.', meals: ['Lunch', 'Dinner'] },
          { day: 2, title: 'Haridwar to Rishikesh & Delhi', description: 'Ram Jhula, Lakshman Jhula, Beatles Ashram visit and evening return to Delhi.', meals: ['Breakfast'] },
        ],
      },
      {
        title: 'Lonavala & Khandala Monsoon Escapes',
        slug: 'mumbai-lonavala-khandala',
        category: 'Monsoon',
        durationDays: 1,
        durationNights: 1,
        packageType: 'Hill Retreat',
        pricePerPerson: 1850,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Mumbai ➔ Lonavala ➔ Khandala',
        departureCity: 'Mumbai',
        destinationCity: 'Lonavala',
        itinerary: [
          { day: 1, title: 'Monsoon Misty Hill Tour', description: 'Drive via Mumbai-Pune Expressway, visit Tiger Point, Bhushi Dam cascades and Karla Caves.', meals: ['Breakfast', 'Snacks'] },
        ],
      },
      {
        title: 'Sundarbans Tiger Reserve & Delta Eco Trail',
        slug: 'kolkata-sundarbans-mangroves',
        category: 'Monsoon',
        durationDays: 3,
        durationNights: 2,
        packageType: 'Rainforest Route',
        pricePerPerson: 5200,
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Kolkata ➔ Gadkhali ➔ Sundarbans',
        departureCity: 'Kolkata',
        destinationCity: 'Sundarbans',
        itinerary: [
          { day: 1, title: 'Kolkata to Delta Base', description: 'Coach pickup to Gadkhali port, motorized boat transfer to eco-resort in the mangroves.', meals: ['Lunch', 'Dinner'] },
          { day: 2, title: 'Sajnekhali Watchtower & Creek Safari', description: 'Full day creek cruise inside mangrove reserve with wildlife spotting.', meals: ['Breakfast', 'Lunch', 'Dinner'] },
          { day: 3, title: 'Village Walk & Return', description: 'Morning local honey harvesting trail and return coach to Kolkata.', meals: ['Breakfast'] },
        ],
      },
      {
        title: 'Royal Rajasthan & Taj Mahal Heritage Odyssey',
        slug: 'delhi-agra-jaipur-golden-triangle',
        category: 'Heritage',
        durationDays: 4,
        durationNights: 3,
        packageType: 'Imperial Heritage',
        pricePerPerson: 6800,
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Delhi ➔ Agra ➔ Jaipur',
        departureCity: 'Delhi',
        destinationCity: 'Jaipur',
        featured: true,
        itinerary: [
          { day: 1, title: 'Delhi to Agra', description: 'Yamuna Expressway transfer, Taj Mahal guided sunset tour and Agra Fort.', meals: ['Lunch', 'Dinner'] },
          { day: 2, title: 'Agra to Jaipur via Fatehpur Sikri', description: 'Visit ghost city Fatehpur Sikri and continue to Pink City Jaipur.', meals: ['Breakfast', 'Dinner'] },
          { day: 3, title: 'Jaipur Forts & Palaces', description: 'Amber Fort elephant trail, Hawa Mahal photo-stop, City Palace tour.', meals: ['Breakfast'] },
          { day: 4, title: 'Jaipur to Delhi Return', description: 'Morning shopping in Johari Bazaar and return coach to Delhi.', meals: ['Breakfast'] },
        ],
      },
      {
        title: 'Shirdi Sai & Trimbakeshwar Jyotirlinga Circuit',
        slug: 'pune-trimbakeshwar-shirdi',
        category: 'Pilgrim',
        durationDays: 2,
        durationNights: 1,
        packageType: 'Temple Tour',
        pricePerPerson: 2950,
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Pune ➔ Trimbakeshwar ➔ Shirdi',
        departureCity: 'Pune',
        destinationCity: 'Shirdi',
        itinerary: [
          { day: 1, title: 'Pune to Trimbakeshwar Jyotirlinga', description: 'Holy abhishekam at Trimbakeshwar Shiva temple, evening transfer to Shirdi.', meals: ['Lunch', 'Dinner'] },
          { day: 2, title: 'Shirdi Sai Samadhi Darshan', description: 'VIP Kakad Aarti darshan, Dwarkamai visit, afternoon return coach to Pune.', meals: ['Breakfast'] },
        ],
      },
      {
        title: 'Goa Coastal Cruiser & Sun-Drenched Beaches',
        slug: 'mumbai-goa-coastal-cruise',
        category: 'Leisure',
        durationDays: 4,
        durationNights: 3,
        packageType: 'Beach Vacation',
        pricePerPerson: 6200,
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Mumbai ➔ Pune ➔ Panaji',
        departureCity: 'Mumbai',
        destinationCity: 'Goa',
        itinerary: [
          { day: 1, title: 'Overnight Multi-Axle Volvo Journey', description: 'Comfortable sleeper ride from Mumbai across scenic Konkan terrain.', meals: ['Water', 'Snack'] },
          { day: 2, title: 'North Goa Coastal Trail', description: 'Baga and Anjuna beach visits, Chapora Fort coastal sunset.', meals: ['Breakfast', 'Dinner'] },
          { day: 3, title: 'Old Goa Heritage Churches', description: 'Basilica of Bom Jesus and Se Cathedral, Mandovi river sundown cruise.', meals: ['Breakfast'] },
          { day: 4, title: 'Return Journey to Mumbai', description: 'Morning leisure on Miramar beach and return journey.', meals: ['Breakfast'] },
        ],
      },
      {
        title: 'Misty Darjeeling Hills & Tea Garden Escapade',
        slug: 'kolkata-darjeeling-toy-train',
        category: 'Leisure',
        durationDays: 3,
        durationNights: 2,
        packageType: 'Mountain Trail',
        pricePerPerson: 5800,
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
        routeDescription: 'Kolkata ➔ Siliguri ➔ Darjeeling',
        departureCity: 'Kolkata',
        destinationCity: 'Darjeeling',
        itinerary: [
          { day: 1, title: 'Siliguri to Darjeeling Foothill Climb', description: 'Scenic mountain ascent via Rohini tea slopes, check in to heritage hotel.', meals: ['Lunch', 'Dinner'] },
          { day: 2, title: 'Tiger Hill Sunrise & Himalayan Mountaineering Institute', description: '4:00 AM Kanchenjunga sunrise view, Batasia Loop, Padmaja Naidu Himalayan Zoo.', meals: ['Breakfast', 'Dinner'] },
          { day: 3, title: 'Darjeeling Mall Road & Return', description: 'Chowrasta walk, Glenary’s bakery breakfast, and return coach to Siliguri/Kolkata.', meals: ['Breakfast'] },
        ],
      },
    ]);

    // 15. Create Platform Settings
    logger.info('Creating platform configuration...');
    await PlatformSettings.create({
      key: 'platform',
      values: {
        platformName: 'YatraBus',
        companyName: 'YatraBus India Private Limited',
        brandName: 'YatraBus',
        platformTitle: 'YatraBus Enterprise Fleet & Operations',
        adminName: 'Vikram Das',
        adminEmail: 'admin@yatrabus.com',
        supportEmail: 'support@yatrabus.in',
        supportPhone: '1800-250-8737',
        convenienceFeePercent: 0,
        gstPercent: 5,
        cancellationCutoffHours: 6,
        autoRefundEnabled: true,
        maxSeatsPerBooking: 6,
        lockDurationMinutes: 8,
      },
    });

    logger.info('🎉 Database seeded successfully with Trip-Centric architecture, realistic routes, buses, and verified SRS data!');
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
