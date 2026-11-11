import mongoose from 'mongoose';

const BusOperatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Operator name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 120,
    },
    fleetCount: {
      type: Number,
      default: 10,
    },
    address: {
      type: String,
      default: 'India Transit Hub',
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

export const BusOperator =
  mongoose.models.BusOperator || mongoose.model('BusOperator', BusOperatorSchema);
