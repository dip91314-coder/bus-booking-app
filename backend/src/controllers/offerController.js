import { Offer, Booking, Trip, Pricing } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import { getOrSet } from '../config/redis.js';

export async function getActiveOffers(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Caching active offers (5 min) via getOrSet helper
    const offers = await getOrSet('offers:active', 300, async () => {
      return Offer.find({
        isActive: true,
        status: { $ne: 'Disabled' },
        $and: [
          { $or: [{ validFrom: null }, { validFrom: { $lte: today } }] },
          { $or: [{ validTo: null }, { validTo: { $gte: today } }, { expiryDate: { $gte: today } }] },
        ],
      }).sort({ createdAt: -1 });
    });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
}

export async function validateOffer(req, res, next) {
  try {
    const { code, bookingId, tripId, seats, seatCount } = req.body;

    if (!code) {
      throw new ValidationError('Coupon code is required.');
    }

    const offer = await Offer.findOne({ code: String(code).toUpperCase().trim() });
    if (!offer) {
      throw new NotFoundError(`Coupon code "${code}" is invalid or does not exist.`);
    }

    if (!offer.isActive || offer.status === 'Disabled') {
      throw new ValidationError(`Coupon "${offer.code}" is currently inactive.`);
    }

    const today = new Date().toISOString().split('T')[0];
    const validFrom = offer.validFrom;
    const validTo = offer.validTo || offer.expiryDate;

    if (validFrom && today < validFrom) {
      throw new ValidationError(`Coupon "${offer.code}" is not yet active.`);
    }

    if (validTo && today > validTo) {
      throw new ValidationError(`Coupon "${offer.code}" expired on ${validTo}.`);
    }

    if (offer.usageLimit > 0 && offer.usedCount >= offer.usageLimit) {
      throw new ValidationError(`Coupon "${offer.code}" has reached its maximum usage limit.`);
    }

    let orderTotal = 0;
    let routeCorridor = '';

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) throw new NotFoundError(`Booking with ID ${bookingId} not found.`);
      orderTotal = booking.totalFare;
      routeCorridor = `${booking.origin}-${booking.destination}`;
    } else if (tripId) {
      const trip = await Trip.findById(tripId).populate('busId routeId');
      if (!trip) throw new NotFoundError(`Trip with ID ${tripId} not found.`);
      const count = Array.isArray(seats) && seats.length > 0 ? seats.length : (seatCount || 1);
      const priceInfo = await Pricing.resolvePrice({
        tripId: trip._id,
        routeId: trip.routeId?._id,
        busId: trip.busId?._id,
      });
      orderTotal = priceInfo.finalPrice * count;
      routeCorridor = `${trip.routeId?.source || trip.routeId?.origin || trip.busId?.origin || ''}-${trip.routeId?.destination || trip.busId?.destination || ''}`;
    } else if (req.body.amount !== undefined) {
      orderTotal = Number(req.body.amount);
    } else {
      throw new ValidationError('bookingId or tripId is required to recompute fare on the backend.');
    }

    const minRequired = offer.minAmount || offer.minBookingAmount || 0;
    if (orderTotal < minRequired) {
      throw new ValidationError(`Coupon requires a minimum booking amount of ₹${minRequired}. Current amount is ₹${orderTotal}.`);
    }

    if (offer.applicableRoutes && offer.applicableRoutes.length > 0 && routeCorridor) {
      const normalizedCorridor = routeCorridor.toLowerCase().replace(/\s+/g, '');
      const matches = offer.applicableRoutes.some((r) => {
        const normR = r.toLowerCase().replace(/\s+/g, '').replace('to', '-');
        return normalizedCorridor.includes(normR) || normR.includes(normalizedCorridor);
      });
      if (!matches) {
        throw new ValidationError(`Coupon is only valid on specific routes: ${offer.applicableRoutes.join(', ')}.`);
      }
    }

    let discount = 0;
    if (offer.discountType === 'percent') {
      const percent = offer.value || offer.discountPercentage;
      discount = Math.round(orderTotal * (percent / 100));
      if (offer.maxDiscount > 0) {
        discount = Math.min(discount, offer.maxDiscount);
      }
    } else {
      discount = Math.min(offer.value, orderTotal);
    }

    const finalAmount = Math.max(0, orderTotal - discount);

    res.status(200).json({
      success: true,
      message: `Coupon ${offer.code} applied successfully! You saved ₹${discount}.`,
      data: {
        code: offer.code,
        title: offer.title,
        description: offer.description,
        discountType: offer.discountType,
        discount,
        originalAmount: orderTotal,
        finalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
}
