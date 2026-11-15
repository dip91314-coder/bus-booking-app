import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    discountType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0 },
    maxDiscount: { type: Number, min: 0, default: 0 },
    minAmount: { type: Number, min: 0, default: 0 },
    minBookingAmount: { type: Number, min: 0, default: 0 },
    validFrom: { type: String, default: null },
    validTo: { type: String, default: null },
    expiryDate: { type: String, default: null },
    usageLimit: { type: Number, min: 0, default: 0 },
    usedCount: { type: Number, min: 0, default: 0 },
    usageCount: { type: Number, min: 0, default: 0 },
    applicableRoutes: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    status: { type: String, enum: ['Active', 'Disabled', 'Expired'], default: 'Active' },
    badge: { type: String, default: '' },
    tag: { type: String, default: '' },
    img: { type: String, default: '' },
    bgGradient: { type: String, default: '' },
  },
  { timestamps: true }
);

OfferSchema.pre('validate', function (next) {
  if (this.discountType === 'percent' && !this.value && this.discountPercentage) {
    this.value = this.discountPercentage;
  }
  if (!this.discountPercentage && this.discountType === 'percent') {
    this.discountPercentage = this.value;
  }
  if (!this.minAmount && this.minBookingAmount) {
    this.minAmount = this.minBookingAmount;
  }
  if (!this.minBookingAmount && this.minAmount) {
    this.minBookingAmount = this.minAmount;
  }
  if (!this.validTo && this.expiryDate) {
    this.validTo = this.expiryDate;
  }
  if (!this.expiryDate && this.validTo) {
    this.expiryDate = this.validTo;
  }
  if (this.usedCount !== undefined && (!this.usageCount || this.usageCount === 0)) {
    this.usageCount = this.usedCount;
  }
  if (this.isActive === false) {
    this.status = 'Disabled';
  } else if (this.status === 'Active') {
    this.isActive = true;
  }
  next();
});

export const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
