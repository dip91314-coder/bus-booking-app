import { Bus } from '../models/Bus.js';
import { Booking } from '../models/Booking.js';
import { Seat } from '../models/Seat.js';
import { NotFoundError, ConflictError } from '../utils/customErrors.js';

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
        busName: bus.busName,
        operator: bus.operator,
        totalSeats: bus.totalSeats,
        availableSeats: Math.max(0, bus.totalSeats - bookedSeatNumbers.size),
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

    // Check if any seat is already booked under a confirmed booking
    const conflictingBooking = await Booking.findOne({
      busId,
      journeyDate,
      bookingStatus: 'confirmed',
      'passengers.seatNumber': { $in: seatNumbers },
    });

    if (conflictingBooking) {
      throw new ConflictError('One or more selected seats have already been booked by another passenger.');
    }

    // 10-minute hold timestamp
    const holdExpiration = new Date(Date.now() + 10 * 60 * 1000);

    for (const seatNo of seatNumbers) {
      await Seat.findOneAndUpdate(
        { busId, journeyDate, seatNumber: seatNo },
        {
          busId,
          journeyDate,
          seatNumber: seatNo,
          status: 'held',
          heldUntil: holdExpiration,
          heldBy: userId,
          price: 999,
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `${seatNumbers.length} seats temporarily held for 10 minutes.`,
      data: {
        seatNumbers,
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

    await Seat.updateMany(
      { busId, journeyDate, seatNumber: { $in: seatNumbers }, status: 'held' },
      { status: 'available', $unset: { heldUntil: '', heldBy: '' } }
    );

    res.status(200).json({
      success: true,
      message: 'Seats released back to available inventory',
    });
  } catch (error) {
    next(error);
  }
}
