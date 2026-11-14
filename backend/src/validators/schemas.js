import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  role: z.literal('user').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const busQuerySchema = z.object({
  origin: z.string().max(100).optional(),
  destination: z.string().max(100).optional(),
  date: z.string().max(20).optional(),
  busType: z.string().max(100).optional(),
  minPrice: z.coerce.number().finite().min(0).optional(),
  maxPrice: z.coerce.number().finite().min(0).optional(),
}).refine(
  (query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice,
  { message: 'minPrice must not exceed maxPrice', path: ['minPrice'] }
);

export const tripQuerySchema = z.object({
  from: z.string().max(100).optional(),
  to: z.string().max(100).optional(),
  origin: z.string().max(100).optional(),
  destination: z.string().max(100).optional(),
  date: z.string().max(20).optional(),
});

export const createBusSchema = z.object({
  busNumber: z.string().min(4, 'Registration number is required'),
  busName: z.string().min(2, 'Bus name is required'),
  operator: z.literal('YatraBus').default('YatraBus'),
  busType: z.string().default('AC Sleeper (2+1)'),
  origin: z.string().min(2, 'Origin city is required'),
  destination: z.string().min(2, 'Destination city is required'),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid departure time (HH:mm) required'),
  arrivalTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid arrival time (HH:mm) required'),
  fare: z.number().min(1, 'Fare must be greater than 0'),
  totalSeats: z.number().min(10).max(60).default(36),
  deckType: z.enum(['single', 'double']).default('double'),
  amenities: z.array(z.string()).optional(),
  boardingPoints: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      time: z.string(),
      landmark: z.string(),
    })
  ).optional(),
  droppingPoints: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      time: z.string(),
      landmark: z.string(),
    })
  ).optional(),
});

export const holdSeatSchema = z.object({
  busId: z.string().min(1, 'Bus ID is required'),
  journeyDate: z.string().min(1, 'Journey date is required'),
  seatNumbers: z.array(z.string()).min(1, 'At least 1 seat required').max(6, 'Maximum 6 seats allowed'),
});

const tripBookingSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  boardingPoint: z.string().optional(),
  droppingPoint: z.string().optional(),
  passengers: z
    .array(
      z.object({
        name: z.string().min(2, 'Passenger name is required'),
        age: z.number().min(1).max(120),
        gender: z.enum(['male', 'female', 'other']),
        seatNumber: z.string().min(1),
        contact: z.string().optional(),
        email: z.string().optional(),
      })
    )
    .min(1)
    .max(6),
  contactEmail: z.string().email(),
  contactPhone: z.string().regex(/^[0-9]{10}$/),
});

const legacyBookingSchema = z.object({
  busId: z.string().min(1, 'Bus ID is required'),
  journeyDate: z.string().min(1, 'Journey date is required'),
  boardingPoint: z.string().min(1, 'Boarding point is required'),
  droppingPoint: z.string().min(1, 'Dropping point is required'),
  seats: z.array(z.string()).min(1, 'At least 1 seat required').max(6, 'Maximum 6 seats per transaction'),
  passengers: z
    .array(
      z.object({
        name: z.string().min(2, 'Passenger name is required'),
        age: z.number().min(1).max(120),
        gender: z.enum(['male', 'female', 'other']),
        seatNumber: z.string().min(1),
      })
    )
    .min(1)
    .max(6),
  paymentMethod: z.string().default('Simulated Payment'),
  contactEmail: z.string().email(),
  contactPhone: z.string().regex(/^[0-9]{10}$/),
}).superRefine((booking, context) => {
  const requestedSeats = booking.seats.map((seat) => seat.toUpperCase().trim());
  const passengerSeats = booking.passengers.map((passenger) => passenger.seatNumber.toUpperCase().trim());
  if (new Set(requestedSeats).size !== requestedSeats.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['seats'], message: 'Each seat can only be selected once.' });
  }
  if (requestedSeats.length !== passengerSeats.length || requestedSeats.some((seat) => !passengerSeats.includes(seat))) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['passengers'],
      message: 'Passenger seats must match the selected seats.',
    });
  }
});

export const createBookingSchema = z.union([tripBookingSchema, legacyBookingSchema]);
