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
} from '../models/index.js';
import { logger } from '../config/logger.js';

export async function seedDatabase() {
  try {
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
    await BusOperator.create([
      { name: 'Greenline Express', contactNumber: '033-2287-9911', email: 'support@greenline.in', rating: 4.8 },
      { name: 'Royal Cruiser', contactNumber: '033-2255-4433', email: 'help@royalcruiser.com', rating: 4.6 },
      { name: 'Zingbus Intercity', contactNumber: '011-4455-6677', email: 'care@zingbus.com', rating: 4.9 },
      { name: 'VRL Travels', contactNumber: '022-2433-1122', email: 'info@vrltravels.com', rating: 4.7 },
      { name: 'SRS Travels', contactNumber: '080-2677-8899', email: 'booking@srstravels.in', rating: 4.5 },
    ]);

    // 3. Create Routes
    logger.info('Creating master routes with boarding & dropping points...');
    const routes = await Route.create([
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
        ],
        droppingPoints: [
          { name: 'Sindhi Camp Bus Stand Jaipur', time: '11:30', landmark: 'Metro Pillar 12' },
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
          { name: 'Vashi Plaza', time: '08:00', landmark: 'Highway Stop' },
        ],
        droppingPoints: [
          { name: 'Wakad Hinjewadi Flyover', time: '10:00', landmark: 'Ginger Hotel' },
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
          { name: 'Electronic City Toll', time: '23:45', landmark: 'Flyover Exit' },
        ],
        droppingPoints: [
          { name: 'Koyambedu CMBT Chennai', time: '05:15', landmark: 'Omni Bus Stand' },
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
        ],
        droppingPoints: [
          { name: 'Private Bus Stand Manali', time: '08:00', landmark: 'Mall Road Entrance' },
        ],
      },
    ]);

    // 4. Create Buses with configured seat layouts
    logger.info('Creating master buses with physical seat layouts...');
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
        availableSeatsCount: 34,
        deckType: 'double',
        rating: 4.8,
        reviewsCount: 342,
        hasLiveTracking: true,
        boardingPoints: routes[0].boardingPoints,
        droppingPoints: routes[0].droppingPoints,
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
        availableSeatsCount: 40,
        deckType: 'single',
        rating: 4.6,
        reviewsCount: 289,
        hasLiveTracking: true,
        boardingPoints: routes[0].boardingPoints,
        droppingPoints: routes[0].droppingPoints,
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
        availableSeatsCount: 36,
        deckType: 'double',
        rating: 4.9,
        reviewsCount: 512,
        hasLiveTracking: true,
        boardingPoints: routes[1].boardingPoints,
        droppingPoints: routes[1].droppingPoints,
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
        availableSeatsCount: 36,
        deckType: 'double',
        rating: 4.7,
        reviewsCount: 420,
        hasLiveTracking: true,
        boardingPoints: routes[2].boardingPoints,
        droppingPoints: routes[2].droppingPoints,
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
        availableSeatsCount: 36,
        deckType: 'double',
        rating: 4.5,
        reviewsCount: 310,
        hasLiveTracking: true,
        boardingPoints: routes[3].boardingPoints,
        droppingPoints: routes[3].droppingPoints,
      },
    ]);

    // 5. Create Pricing Rules
    logger.info('Creating pricing rules...');
    for (const bus of buses) {
      await Pricing.create({
        busId: bus._id,
        seatType: 'seater',
        basePrice: bus.fare,
        additionalCharges: 0,
        taxPercent: 5,
      });
      if (bus.deckType === 'double') {
        await Pricing.create({
          busId: bus._id,
          seatType: 'sleeper',
          basePrice: bus.fare + 100,
          additionalCharges: 50,
          taxPercent: 5,
        });
      }
    }

    // 6. Create Scheduled Trips (for today, tomorrow, and Nov 20, 2026)
    logger.info('Scheduling trips across active dates...');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrowDate = new Date(now.getTime() + 86400000);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];
    const targetDates = [today, tomorrow, '2026-11-20'];

    const createdTrips = [];
    for (const date of targetDates) {
      // Kolkata -> Siliguri Trips
      const trip1 = await Trip.create({
        busId: buses[0]._id,
        routeId: routes[0]._id,
        travelDate: date,
        departureTime: '20:00',
        arrivalTime: '06:30',
        boardingPoints: routes[0].boardingPoints,
        droppingPoints: routes[0].droppingPoints,
        status: 'scheduled',
        baseFare: 1150,
      });
      createdTrips.push(trip1);

      const trip2 = await Trip.create({
        busId: buses[1]._id,
        routeId: routes[0]._id,
        travelDate: date,
        departureTime: '21:30',
        arrivalTime: '08:00',
        boardingPoints: routes[0].boardingPoints,
        droppingPoints: routes[0].droppingPoints,
        status: 'scheduled',
        baseFare: 890,
      });
      createdTrips.push(trip2);

      // Delhi -> Jaipur Trip
      const trip3 = await Trip.create({
        busId: buses[2]._id,
        routeId: routes[1]._id,
        travelDate: date,
        departureTime: '06:30',
        arrivalTime: '11:45',
        boardingPoints: routes[1].boardingPoints,
        droppingPoints: routes[1].droppingPoints,
        status: 'scheduled',
        baseFare: 650,
      });
      createdTrips.push(trip3);

      // Mumbai -> Pune Trip
      const trip4 = await Trip.create({
        busId: buses[3]._id,
        routeId: routes[2]._id,
        travelDate: date,
        departureTime: '07:00',
        arrivalTime: '10:30',
        boardingPoints: routes[2].boardingPoints,
        droppingPoints: routes[2].droppingPoints,
        status: 'scheduled',
        baseFare: 450,
      });
      createdTrips.push(trip4);
    }

    // 7. Initial Confirmed Booking & SeatReservations on Kolkata->Siliguri
    logger.info('Creating sample confirmed booking with SeatReservations & Ticket...');
    const targetTrip = createdTrips.find(
      (t) => t.travelDate === '2026-11-20' && t.busId.toString() === buses[0]._id.toString()
    ) || createdTrips[0];

    const sampleSeats = ['L1', 'L4'];
    const pnrCode = 'BK-98F42A7C';

    const booking = await Booking.create({
      bookingReference: pnrCode,
      pnr: pnrCode,
      userId: regularUser._id,
      tripId: targetTrip._id,
      busId: buses[0]._id,
      busName: buses[0].busName,
      operator: buses[0].operator,
      busNumber: buses[0].busNumber,
      busType: buses[0].busType,
      origin: 'Kolkata',
      destination: 'Siliguri',
      journeyDate: targetTrip.travelDate,
      departureTime: targetTrip.departureTime,
      arrivalTime: targetTrip.arrivalTime,
      boardingPoint: 'Esplanade Bus Terminus (Platform 4)',
      droppingPoint: 'Tenzing Norgay Bus Stand Siliguri',
      seats: sampleSeats,
      passengers: [
        { name: 'Rahul Sen', age: 24, gender: 'male', seatNumber: 'L1', contact: '9876543210', email: 'rahul@yatra.com' },
        { name: 'Ananya Sen', age: 22, gender: 'female', seatNumber: 'L4', contact: '9876543210', email: 'rahul@yatra.com' },
      ],
      priceBreakdown: {
        basePrice: 2300,
        additionalCharges: 0,
        taxAmount: 115,
        totalAmount: 2415,
      },
      totalFare: 2415,
      bookingStatus: 'confirmed',
      paymentStatus: 'successful',
      paymentMethod: 'UPI',
      contactEmail: regularUser.email,
      contactPhone: regularUser.phone,
    });

    // Create confirmed SeatReservations for the booking
    for (const seatNo of sampleSeats) {
      await SeatReservation.create({
        tripId: targetTrip._id,
        busId: buses[0]._id,
        travelDate: targetTrip.travelDate,
        seatNumber: seatNo,
        bookingId: booking._id,
        userId: regularUser._id,
        status: 'booked',
        lockExpiresAt: null,
      });
    }

    // Create successful Payment record
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: regularUser._id,
      amount: 2415,
      currency: 'INR',
      gateway: 'Mock',
      gatewayOrderId: 'order_mock_seed_001',
      gatewayPaymentId: 'pay_mock_seed_001',
      transactionReference: 'TXN-SEED-98F42A7C',
      paymentMethod: 'UPI',
      status: 'successful',
    });

    // Create Ticket snapshot
    await Ticket.create({
      bookingId: booking._id,
      pnr: pnrCode,
      journeySnapshot: {
        busName: buses[0].busName,
        busNumber: buses[0].busNumber,
        busType: buses[0].busType,
        source: 'Kolkata',
        destination: 'Siliguri',
        travelDate: targetTrip.travelDate,
        departureTime: targetTrip.departureTime,
        arrivalTime: targetTrip.arrivalTime,
        boardingPoint: 'Esplanade Bus Terminus (Platform 4)',
        droppingPoint: 'Tenzing Norgay Bus Stand Siliguri',
        duration: '10h 30m',
      },
      passengerSnapshot: [
        { name: 'Rahul Sen', age: 24, gender: 'male', seatNumber: 'L1', contact: '9876543210', email: 'rahul@yatra.com' },
        { name: 'Ananya Sen', age: 22, gender: 'female', seatNumber: 'L4', contact: '9876543210', email: 'rahul@yatra.com' },
      ],
      seats: sampleSeats,
      priceBreakdown: {
        basePrice: 2300,
        additionalCharges: 0,
        taxAmount: 115,
        totalAmount: 2415,
      },
      paymentStatus: 'Successful',
    });

    logger.info('🎉 Database seeded successfully with Trip-Centric architecture and verified relations!');
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
