import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    pnr: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    journeySnapshot: {
      busName: { type: String, required: true },
      busNumber: { type: String, required: true },
      busType: { type: String, default: 'AC Sleeper (2+1)' },
      source: { type: String, required: true },
      destination: { type: String, required: true },
      from_location: { type: String, default: '' },
      to_location: { type: String, default: '' },
      travelDate: { type: String, required: true },
      departureTime: { type: String, required: true },
      arrivalTime: { type: String, required: true },
      boardingPoint: { type: String, default: '' },
      droppingPoint: { type: String, default: '' },
      pickup_point: { type: String, default: '' },
      drop_point: { type: String, default: '' },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      duration: { type: String, default: '' },
    },
    passengerSnapshot: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
        seatNumber: { type: String, required: true },
        contact: { type: String, default: '' },
        email: { type: String, default: '' },
      },
    ],
    seats: {
      type: [String],
      required: true,
    },
    priceBreakdown: {
      basePrice: { type: Number, required: true },
      additionalCharges: { type: Number, default: 0 },
      taxAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
    },
    paymentStatus: {
      type: String,
      default: 'Successful',
    },
    bookingStatus: {
      type: String,
      default: 'confirmed',
    },
    paymentMethod: {
      type: String,
      default: 'Online Payment',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
