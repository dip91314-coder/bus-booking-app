import mongoose from 'mongoose';
import { Bus } from './Bus.js';

const PricingSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      default: null,
      index: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
      index: true,
    },
    seatType: {
      type: String,
      enum: ['sleeper', 'seater', 'semi-sleeper', 'all'],
      default: 'all',
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 5,
      min: 0,
    },
    effectiveStartDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    effectiveEndDate: {
      type: String, // YYYY-MM-DD
      default: null,
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

PricingSchema.index({ tripId: 1, seatType: 1 });
PricingSchema.index({ routeId: 1, busId: 1 });

/**
 * Resolves the price in order of specificity:
 * 1. Trip-specific pricing
 * 2. Route + Bus pricing
 * 3. Route-specific pricing
 * 4. Bus default pricing (fallback to bus.fare)
 */
PricingSchema.statics.resolvePrice = async function ({ tripId, routeId, busId, seatType = 'seater' }) {
  // 1. Trip pricing
  if (tripId) {
    const tripPrice = await this.findOne({
      tripId,
      isActive: true,
      $or: [{ seatType }, { seatType: 'all' }],
    }).sort({ seatType: seatType === 'all' ? 1 : -1 });

    if (tripPrice) {
      return computePriceDetails(tripPrice);
    }
  }

  // 2. Route + Bus pricing
  if (routeId && busId) {
    const routeBusPrice = await this.findOne({
      routeId,
      busId,
      tripId: null,
      isActive: true,
      $or: [{ seatType }, { seatType: 'all' }],
    }).sort({ seatType: seatType === 'all' ? 1 : -1 });

    if (routeBusPrice) {
      return computePriceDetails(routeBusPrice);
    }
  }

  // 3. Route pricing
  if (routeId) {
    const routePrice = await this.findOne({
      routeId,
      busId: null,
      tripId: null,
      isActive: true,
      $or: [{ seatType }, { seatType: 'all' }],
    }).sort({ seatType: seatType === 'all' ? 1 : -1 });

    if (routePrice) {
      return computePriceDetails(routePrice);
    }
  }

  // 4. Bus default pricing
  if (busId) {
    const busPrice = await this.findOne({
      busId,
      routeId: null,
      tripId: null,
      isActive: true,
      $or: [{ seatType }, { seatType: 'all' }],
    }).sort({ seatType: seatType === 'all' ? 1 : -1 });

    if (busPrice) {
      return computePriceDetails(busPrice);
    }

    const busDoc = await Bus.findById(busId);
    if (busDoc && busDoc.fare) {
      const base = busDoc.fare;
      const additional = seatType === 'sleeper' ? 100 : 0;
      const tax = Math.round((base + additional) * 0.05);
      return {
        basePrice: base,
        additionalCharges: additional,
        taxPercent: 5,
        taxAmount: tax,
        finalPrice: base + additional + tax,
      };
    }
  }

  // Default fallback
  const base = 500;
  return {
    basePrice: base,
    additionalCharges: 0,
    taxPercent: 5,
    taxAmount: Math.round(base * 0.05),
    finalPrice: base + Math.round(base * 0.05),
  };
};

function computePriceDetails(pricingDoc) {
  const base = pricingDoc.basePrice;
  const additional = pricingDoc.additionalCharges || 0;
  const taxPercent = pricingDoc.taxPercent !== undefined ? pricingDoc.taxPercent : 5;
  const tax = Math.round((base + additional) * (taxPercent / 100));
  return {
    basePrice: base,
    additionalCharges: additional,
    taxPercent,
    taxAmount: tax,
    finalPrice: base + additional + tax,
  };
}

export const Pricing = mongoose.models.Pricing || mongoose.model('Pricing', PricingSchema);
