import mongoose from 'mongoose';

const SeatReservationSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
      index: true,
    },
    travelDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Travel date is required'],
      index: true,
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      uppercase: true,
      trim: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['locked', 'booked'],
      required: true,
      index: true,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// THE SINGLE MOST IMPORTANT CONSTRAINTS:
// A seat must never be double-booked or concurrently locked for the same trip
SeatReservationSchema.index({ tripId: 1, seatNumber: 1 }, { unique: true });
SeatReservationSchema.index({ lockExpiresAt: 1 });
SeatReservationSchema.index({ tripId: 1, status: 1 });

export const SeatReservation =
  mongoose.models.SeatReservation || mongoose.model('SeatReservation', SeatReservationSchema);
