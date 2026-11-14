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
    contact: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const PriceBreakdownSchema = new mongoose.Schema(
  {
    basePrice: { type: Number, default: 0 },
    additionalCharges: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
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
    pnr: {
      type: String,
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
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
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
    priceBreakdown: {
      type: PriceBreakdownSchema,
      default: () => ({}),
    },
    totalFare: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'expired', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'successful', 'failed', 'refunded', 'refund_required'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'Online Payment',
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

BookingSchema.pre('save', function (next) {
  if (!this.pnr && this.bookingReference) {
    this.pnr = this.bookingReference;
  }
  if (!this.bookingReference && this.pnr) {
    this.bookingReference = this.pnr;
  }
  next();
});

// Compound Unique Index on busId + journeyDate + seatNumber for confirmed bookings (legacy safety)
BookingSchema.index(
  { busId: 1, journeyDate: 1, 'passengers.seatNumber': 1 },
  {
    unique: true,
    partialFilterExpression: { bookingStatus: 'confirmed' },
  }
);

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
