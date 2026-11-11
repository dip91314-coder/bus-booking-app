import mongoose from 'mongoose';

const RouteSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: [true, 'Origin city is required'],
      trim: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
      index: true,
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    estimatedDuration: {
      type: String,
      required: true,
      default: '8h 00m',
    },
    popularStops: {
      type: [String],
      default: [],
    },
    highwayNumber: {
      type: String,
      default: 'NH-National Corridor',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

RouteSchema.index({ origin: 1, destination: 1 });

export const Route = mongoose.models.Route || mongoose.model('Route', RouteSchema);
