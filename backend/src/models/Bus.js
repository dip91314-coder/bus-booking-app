import mongoose from 'mongoose';

const BusSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Bus registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    busName: {
      type: String,
      required: true,
      trim: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusOperator',
    },
    operator: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    busType: {
      type: String,
      required: true,
      default: 'AC Sleeper (2+1)',
    },
    isAc: {
      type: Boolean,
      default: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
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
    journeyDuration: {
      type: String,
      required: true,
      default: '8h 00m',
    },
    fare: {
      type: Number,
      required: true,
      min: 1,
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 36,
    },
    operationalStatus: {
      type: String,
      enum: ['Active', 'Maintenance', 'Inactive'],
      default: 'Active',
      index: true,
    },
    assignedDriver: {
      type: String,
      trim: true,
      default: '',
    },
    lastServiceDate: {
      type: String,
      default: '',
    },
    availableSeatsCount: {
      type: Number,
      default: 36,
    },
    deckType: {
      type: String,
      enum: ['single', 'double'],
      default: 'double',
    },
    amenities: {
      type: [String],
      default: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Live GPS'],
    },
    boardingPoints: [
      {
        id: String,
        name: String,
        time: String,
        landmark: String,
      },
    ],
    droppingPoints: [
      {
        id: String,
        name: String,
        time: String,
        landmark: String,
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 150,
    },
    hasLiveTracking: {
      type: Boolean,
      default: true,
    },
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 6 hours before departure.',
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

BusSchema.index({ origin: 1, destination: 1, isActive: 1 });

export const Bus = mongoose.models.Bus || mongoose.model('Bus', BusSchema);
