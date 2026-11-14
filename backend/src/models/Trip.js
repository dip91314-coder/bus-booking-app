import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    time: { type: String, default: '' },
    landmark: { type: String, default: '' },
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
      index: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route ID is required'],
      index: true,
    },
    travelDate: {
      type: String, // ISO date string: YYYY-MM-DD
      required: [true, 'Travel date is required (YYYY-MM-DD)'],
      index: true,
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required'],
    },
    boardingPoints: {
      type: [PointSchema],
      default: [],
    },
    droppingPoints: {
      type: [PointSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    baseFare: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Concurrency invariant: One physical bus can only depart once at the exact same travelDate and departureTime
TripSchema.index({ busId: 1, travelDate: 1, departureTime: 1 }, { unique: true });
TripSchema.index({ routeId: 1, travelDate: 1, status: 1 });
TripSchema.index({ travelDate: 1, status: 1 });

export const Trip = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
