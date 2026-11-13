import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    experienceYears: { type: Number, required: true, min: 1 },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
    status: {
      type: String,
      enum: ['Available', 'On Journey', 'On Leave'],
      default: 'Available',
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    tripsCompleted: { type: Number, min: 0, default: 0 },
    joinedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Driver = mongoose.models.Driver || mongoose.model('Driver', DriverSchema);
