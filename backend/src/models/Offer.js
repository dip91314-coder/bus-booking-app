import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    maxDiscount: { type: Number, min: 0, default: 0 },
    minBookingAmount: { type: Number, min: 0, default: 0 },
    expiryDate: { type: String, required: true },
    usageCount: { type: Number, min: 0, default: 0 },
    usageLimit: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Active', 'Disabled', 'Expired'], default: 'Active' },
  },
  { timestamps: true }
);

export const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
