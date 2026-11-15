import mongoose from 'mongoose';

const SavedPassengerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    berthPreference: {
      type: String,
      enum: ['lower', 'upper', 'no-preference'],
      default: 'no-preference',
    },
  },
  {
    timestamps: true,
  }
);

export const SavedPassenger =
  mongoose.models.SavedPassenger || mongoose.model('SavedPassenger', SavedPassengerSchema);
