import mongoose from 'mongoose';

const PassengerEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
      index: true,
    },
    busName: { type: String, required: true },
    operator: { type: String, required: true },
    busNumber: { type: String, required: true },
    busType: { type: String, required: true },
    origin: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    journeyDate: { type: String, required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    boardingPoint: { type: String, required: true },
    droppingPoint: { type: String, required: true },
    seats: {
      type: [String],
      required: true,
    },
    passengers: {
      type: [PassengerEntrySchema],
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
      min: 1,
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'refunded', 'pending'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      default: 'Simulated Payment',
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index to eliminate double seat bookings at the database engine level
BookingSchema.index(
  { busId: 1, journeyDate: 1, 'passengers.seatNumber': 1 },
  {
    unique: true,
    partialFilterExpression: { bookingStatus: 'confirmed' },
  }
);

export const Booking =
  mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
