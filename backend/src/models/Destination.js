import mongoose from 'mongoose';

const DestinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true,
    },
    tag: {
      type: String,
      enum: ['Hill Station', 'Heritage', 'Beach', 'Pilgrimage', 'Wildlife', 'City', 'Spiritual'],
      default: 'Heritage',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    popularPickups: {
      type: [String],
      default: [],
    },
    startingFare: {
      type: Number,
      default: 450,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    seoTitle: {
      type: String,
      default: '',
    },
    seoDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Destination =
  mongoose.models.Destination || mongoose.model('Destination', DestinationSchema);
