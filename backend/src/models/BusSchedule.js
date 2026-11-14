import mongoose from 'mongoose';

const BusScheduleSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
      index: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
    },
    journeyDate: {
      type: String,
      required: true,
      index: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      default: 36,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      default: 36,
    },
    status: {
      type: String,
      enum: ['scheduled', 'departed', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BusScheduleSchema.index({ busId: 1, journeyDate: 1 }, { unique: true });

export const BusSchedule =
  mongoose.models.BusSchedule || mongoose.model('BusSchedule', BusScheduleSchema);
