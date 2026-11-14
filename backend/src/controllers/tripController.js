import { Trip, Bus, Route, SeatReservation, Pricing } from '../models/index.js';
import { getTripSeats, lockSeats, releaseLocks } from '../services/seatLockService.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';

export async function searchTrips(req, res, next) {
  try {
    const { from, to, date, origin, destination } = req.query;

    const sourceCity = (from || origin || '').trim();
    const destCity = (to || destination || '').trim();
    const journeyDate = (date || '').trim();

    const query = { status: { $in: ['scheduled', 'active'] } };

    if (journeyDate) {
      query.travelDate = journeyDate;
    }

    if (sourceCity && destCity) {
      // Find matching routes
      const matchingRoutes = await Route.find({
        $and: [
          { $or: [{ origin: new RegExp(`^${sourceCity}$`, 'i') }, { source: new RegExp(`^${sourceCity}$`, 'i') }] },
          { destination: new RegExp(`^${destCity}$`, 'i') },
        ],
        isActive: true,
      });

      const routeIds = matchingRoutes.map((r) => r._id);
      query.routeId = { $in: routeIds };
    }

    const trips = await Trip.find(query).populate('busId routeId').sort({ departureTime: 1 });

    const now = new Date();
    const results = [];

    for (const trip of trips) {
      const bus = trip.busId;
      if (!bus || bus.operationalStatus === 'Inactive' || bus.isActive === false) {
        continue;
      }

      // Count booked and actively locked seats
      const activeReservations = await SeatReservation.countDocuments({
        tripId: trip._id,
        $or: [{ status: 'booked' }, { status: 'locked', lockExpiresAt: { $gt: now } }],
      });

      const totalSeats = bus.totalSeats || (bus.seatLayout || []).length || 36;
      const availableSeats = Math.max(0, totalSeats - activeReservations);

      // Resolve pricing
      const priceDetails = await Pricing.resolvePrice({
        tripId: trip._id,
        routeId: trip.routeId?._id,
        busId: bus._id,
        seatType: 'seater',
      });

      results.push({
        id: trip._id,
        tripId: trip._id,
        busId: bus._id,
        busName: bus.busName,
        busNumber: bus.busNumber,
        busType: bus.busType,
        deckType: bus.deckType,
        operator: bus.operator,
        source: trip.routeId?.source || trip.routeId?.origin || bus.origin,
        destination: trip.routeId?.destination || bus.destination,
        origin: trip.routeId?.source || trip.routeId?.origin || bus.origin,
        travelDate: trip.travelDate,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        journeyDuration: trip.routeId?.estimatedDuration || bus.journeyDuration || '8h 00m',
        boardingPoints: trip.boardingPoints?.length ? trip.boardingPoints : bus.boardingPoints,
        droppingPoints: trip.droppingPoints?.length ? trip.droppingPoints : bus.droppingPoints,
        totalSeats,
        availableSeats,
        fare: priceDetails.basePrice,
        price: priceDetails.finalPrice,
        priceBreakdown: priceDetails,
        rating: bus.rating || 4.7,
        amenities: bus.amenities || [],
        status: trip.status,
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTripById(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id).populate('busId routeId');
    if (!trip) {
      throw new NotFoundError(`Trip with ID ${id} not found.`);
    }

    const priceDetails = await Pricing.resolvePrice({
      tripId: trip._id,
      routeId: trip.routeId?._id,
      busId: trip.busId?._id,
    });

    res.status(200).json({
      success: true,
      data: {
        ...trip.toObject(),
        priceBreakdown: priceDetails,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTripSeatsHandler(req, res, next) {
  try {
    const { tripId } = req.params;
    const result = await getTripSeats(tripId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function lockSeatsHandler(req, res, next) {
  try {
    const { tripId } = req.params;
    const { seatNumbers } = req.body;
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      throw new ValidationError('Authentication required to reserve seats.');
    }

    const result = await lockSeats({ tripId, seatNumbers, userId });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function releaseLocksHandler(req, res, next) {
  try {
    const { tripId } = req.params;
    const { seatNumbers } = req.body;
    const userId = req.user?.userId || req.user?._id;

    const result = await releaseLocks({ tripId, seatNumbers, userId });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
