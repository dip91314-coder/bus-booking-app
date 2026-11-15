import mongoose from 'mongoose';

const ItineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    meals: { type: [String], default: [] },
  },
  { _id: false }
);

const TripPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Package slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Pilgrim', 'Konkan', 'Leisure', 'Monsoon', 'Heritage'],
      required: true,
      index: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    durationNights: {
      type: Number,
      required: true,
      min: 0,
    },
    packageType: {
      type: String,
      required: true,
      trim: true,
      default: 'Scenic Circuit',
    },
    pricePerPerson: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    routeDescription: {
      type: String,
      required: true,
      trim: true,
    },
    departureCity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    itinerary: {
      type: [ItineraryDaySchema],
      default: [],
    },
    inclusions: {
      type: [String],
      default: ['AC Bus Travel', 'Accommodation', 'Complimentary Breakfast', 'Sightseeing Transfers'],
    },
    exclusions: {
      type: [String],
      default: ['Personal Expenses', 'Monument Entry Fees', 'Lunch and Dinner'],
    },
    availableDays: {
      type: [String],
      default: ['Friday', 'Saturday', 'Sunday'],
    },
    featured: {
      type: Boolean,
      default: false,
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

TripPackageSchema.index({ category: 1, isActive: 1 });
TripPackageSchema.index({ departureCity: 1, destinationCity: 1, isActive: 1 });

export const TripPackage =
  mongoose.models.TripPackage || mongoose.model('TripPackage', TripPackageSchema);
