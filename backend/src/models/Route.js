import mongoose from 'mongoose';

const RouteStopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    time: { type: String, default: '' },
    landmark: { type: String, default: '' },
  },
  { _id: false }
);

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
    source: {
      type: String,
      trim: true,
    },
    departurePoint: {
      type: String,
      trim: true,
      default: '',
    },
    arrivalPoint: {
      type: String,
      trim: true,
      default: '',
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMinutes: {
      type: Number,
      default: 480,
    },
    estimatedDuration: {
      type: String,
      required: true,
      default: '8h 00m',
    },
    intermediateStops: {
      type: [String],
      default: [],
    },
    popularStops: {
      type: [String],
      default: [],
    },
    boardingPoints: {
      type: [RouteStopSchema],
      default: [],
    },
    droppingPoints: {
      type: [RouteStopSchema],
      default: [],
    },
    highwayNumber: {
      type: String,
      default: 'NH-National Corridor',
    },
    baseFare: {
      type: Number,
      min: 0,
      default: 0,
    },
    activeBusesCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
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

RouteSchema.pre('save', function (next) {
  if (!this.source && this.origin) {
    this.source = this.origin;
  }
  if (!this.origin && this.source) {
    this.origin = this.source;
  }
  if (this.intermediateStops?.length && !this.popularStops?.length) {
    this.popularStops = this.intermediateStops;
  }
  if (this.popularStops?.length && !this.intermediateStops?.length) {
    this.intermediateStops = this.popularStops;
  }
  next();
});

RouteSchema.index({ origin: 1, destination: 1 });
RouteSchema.index({ source: 1, destination: 1 });

export const Route = mongoose.models.Route || mongoose.model('Route', RouteSchema);
