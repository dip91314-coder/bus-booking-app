import { Bus } from '../models/Bus.js';
import { Booking } from '../models/Booking.js';
import { Seat } from '../models/Seat.js';
import { NotFoundError, ConflictError } from '../utils/customErrors.js';
import { normalizeYatraBus } from '../utils/yatraFleet.js';

export async function getSeatsByBus(req, res, next) {
  try {
    const { busId } = req.params;
    const { date } = req.query;
    const journeyDate = String(date || new Date().toISOString().split('T')[0]);

    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new NotFoundError(`Bus with ID ${busId} not found.`);
    }

    // Find all confirmed bookings for this bus on this journey date
    const confirmedBookings = await Booking.find({
      busId,
      journeyDate,
      bookingStatus: 'confirmed',
    });

    const bookedSeatNumbers = new Set();
    confirmedBookings.forEach((b) => {
      b.seats.forEach((s) => bookedSeatNumbers.add(s));
    });

    // Check currently held seats (within 10-minute hold window)
    const activeHeldSeats = await Seat.find({
      busId,
      journeyDate,
      status: 'held',
      heldUntil: { $gt: new Date() },
    });
    const heldSeatNumbers = new Set();
    activeHeldSeats.forEach((s) => heldSeatNumbers.add(s.seatNumber));
    const unavailableSeatNumbers = new Set([...bookedSeatNumbers, ...heldSeatNumbers]);

    // Construct 2-deck layout (Lower and Upper deck for sleepers)
    const isDoubleDeck = bus.deckType === 'double';
    const totalLower = isDoubleDeck ? 18 : bus.totalSeats;
    const totalUpper = isDoubleDeck ? 18 : 0;

    const lowerDeck = Array.from({ length: totalLower }, (_, i) => {
      const seatNo = isDoubleDeck ? `L${i + 1}` : `S${i + 1}`;
      const isBooked = bookedSeatNumbers.has(seatNo);
      const isHeld = heldSeatNumbers.has(seatNo);
      const isLadies = [3, 4, 7].includes(i);

      let status = 'available';
      if (isBooked) status = 'booked';
      else if (isHeld) status = 'held';

      return {
        number: seatNo,
        deck: 'lower',
        type: i % 3 === 0 ? 'single' : 'double',
        price: bus.fare,
        status,
        isLadies,
      };
    });

    const upperDeck = Array.from({ length: totalUpper }, (_, i) => {
      const seatNo = `U${i + 1}`;
      const isBooked = bookedSeatNumbers.has(seatNo);
      const isHeld = heldSeatNumbers.has(seatNo);
      const isLadies = [1, 2].includes(i);

      let status = 'available';
      if (isBooked) status = 'booked';
      else if (isHeld) status = 'held';

      return {
        number: seatNo,
        deck: 'upper',
        type: i % 3 === 0 ? 'single' : 'double',
        price: bus.fare + 100,
        status,
        isLadies,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        busId,
        journeyDate,
        busName: normalizeYatraBus(bus).busName,
        operator: 'YatraBus',
        totalSeats: bus.totalSeats,
        availableSeats: Math.max(0, bus.totalSeats - unavailableSeatNumbers.size),
        bookedSeats: Array.from(bookedSeatNumbers),
        heldSeats: Array.from(heldSeatNumbers),
        seats: {
          lower: lowerDeck,
          upper: upperDeck,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function holdSeats(req, res, next) {
  try {
    const { busId, journeyDate, seatNumbers } = req.body;
    const userId = req.user?.userId;
    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new NotFoundError(`Bus with ID ${busId} not found.`);
    }

    const normalizedSeats = [...new Set(seatNumbers.map((seat) => String(seat).toUpperCase().trim()))];
    const seatLayout = new Map((bus.seatLayout || []).map((seat) => [seat.seatNumber, seat]));
    const invalidSeats = normalizedSeats.filter((seat) => !seatLayout.has(seat));
    if (invalidSeats.length > 0) {
      throw new ConflictError(`The following seats do not exist on this bus: ${invalidSeats.join(', ')}`);
    }

    // Check if any seat is already booked under a confirmed booking
    const conflictingBooking = await Booking.findOne({
      busId,
      journeyDate,
      bookingStatus: 'confirmed',
      'passengers.seatNumber': { $in: normalizedSeats },
    });

    if (conflictingBooking) {
      throw new ConflictError('One or more selected seats have already been booked by another passenger.');
    }

    const now = new Date();
    const holdExpiration = new Date(now.getTime() + 10 * 60 * 1000);
    const existingOwnHolds = await Seat.find({
      busId,
      journeyDate,
      seatNumber: { $in: normalizedSeats },
      status: 'held',
      heldBy: userId,
      heldUntil: { $gt: now },
    }).select('seatNumber');
    const existingOwnSeatNumbers = new Set(existingOwnHolds.map((seat) => seat.seatNumber));
    const newlyHeldSeatNumbers = [];

    try {
      for (const seatNo of normalizedSeats) {
        const layout = seatLayout.get(seatNo);
        const heldSeat = await Seat.findOneAndUpdate(
          {
            busId,
            journeyDate,
            seatNumber: seatNo,
            $or: [
              { status: 'available' },
              { status: 'held', heldUntil: { $lte: now } },
              { status: 'held', heldBy: userId, heldUntil: { $gt: now } },
            ],
          },
          {
            $set: {
              status: 'held',
              heldUntil: holdExpiration,
              heldBy: userId,
              price: layout.type === 'sleeper' ? bus.fare + 100 : bus.fare,
              deck: layout.position,
              type: layout.type === 'sleeper' ? 'single' : 'seater',
              isLadies: layout.isLadies,
            },
            $setOnInsert: { busId, journeyDate, seatNumber: seatNo },
          },
          { upsert: true, new: true, runValidators: true }
        );
        if (!heldSeat) {
          throw new ConflictError(`Seat ${seatNo} is already held or booked.`);
        }
        if (!existingOwnSeatNumbers.has(seatNo)) {
          newlyHeldSeatNumbers.push(seatNo);
        }
      }
    } catch (error) {
      if (newlyHeldSeatNumbers.length > 0) {
        await Seat.updateMany(
          {
            busId,
            journeyDate,
            seatNumber: { $in: newlyHeldSeatNumbers },
            status: 'held',
            heldBy: userId,
          },
          { $set: { status: 'available' }, $unset: { heldUntil: '', heldBy: '' } }
        );
      }
      if (error.code === 11000) {
        throw new ConflictError('One or more selected seats are already held or booked.');
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: `${normalizedSeats.length} seats temporarily held for 10 minutes.`,
      data: {
        seatNumbers: normalizedSeats,
        expiresAt: holdExpiration,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function releaseSeats(req, res, next) {
  try {
    const { busId, journeyDate, seatNumbers } = req.body;
    const userId = req.user?.userId;

    const result = await Seat.updateMany(
      { busId, journeyDate, seatNumber: { $in: seatNumbers.map((seat) => String(seat).toUpperCase().trim()) }, status: 'held', heldBy: userId },
      { status: 'available', $unset: { heldUntil: '', heldBy: '' } }
    );

    res.status(200).json({
      success: true,
      message: 'Your held seats were released back to available inventory.',
      data: { releasedCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
}
