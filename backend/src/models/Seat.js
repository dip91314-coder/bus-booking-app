import mongoose from 'mongoose';

const SeatSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
      index: true,
    },
    journeyDate: {
      type: String,
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    deck: {
      type: String,
      enum: ['lower', 'upper'],
      default: 'lower',
    },
    type: {
      type: String,
      enum: ['single', 'double', 'seater', 'semi-sleeper'],
      default: 'single',
    },
    price: {
      type: Number,
      required: true,
    },
    isLadies: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'held'],
      default: 'available',
      index: true,
    },
    heldUntil: {
      type: Date,
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

SeatSchema.index({ busId: 1, journeyDate: 1, seatNumber: 1 }, { unique: true });

export const Seat = mongoose.models.Seat || mongoose.model('Seat', SeatSchema);
