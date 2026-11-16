import mongoose from 'mongoose';
import { Ticket, Booking } from '../models/index.js';
import { generateTicketPdf } from '../services/pdfTicketService.js';
import { NotFoundError, UnauthorizedError } from '../utils/customErrors.js';
import { normalizeYatraBus } from '../utils/yatraFleet.js';

function normalizeTicket(ticket) {
  const value = typeof ticket.toObject === 'function' ? ticket.toObject() : { ...ticket };
  return {
    ...value,
    journeySnapshot: {
      ...value.journeySnapshot,
      busName: normalizeYatraBus(value.journeySnapshot || {}).busName,
    },
  };
}

async function findOrCreateOwnedTicket(identifier, user) {
  if (!identifier) {
    throw new NotFoundError('Ticket identifier is required.');
  }

  const rawId = String(identifier).trim();
  const upperId = rawId.toUpperCase();
  const isObjectId = mongoose.isValidObjectId(rawId);

  // 1. Try to find an existing Ticket in database
  const ticketQuery = isObjectId
    ? { $or: [{ _id: rawId }, { bookingId: rawId }, { pnr: upperId }] }
    : { pnr: upperId };

  let ticket = await Ticket.findOne(ticketQuery);

  if (ticket) {
    const booking = await Booking.findById(ticket.bookingId);
    if (booking) {
      // Authorization check: non-admin can only access their own bookings
      if (user.role !== 'admin' && String(booking.userId) !== String(user.userId)) {
        throw new NotFoundError('Ticket not found.');
      }

      // Sync latest booking status
      if (booking.bookingStatus) {
        ticket.status = booking.bookingStatus;
      }
      return ticket;
    }

    if (user.role === 'admin') {
      return ticket;
    }
  }

  // 2. Fallback: Lookup Booking directly (handles bookings where Ticket document was not pre-created)
  const bookingQuery = isObjectId
    ? { $or: [{ _id: rawId }, { bookingReference: upperId }, { pnr: upperId }] }
    : { $or: [{ bookingReference: upperId }, { pnr: upperId }] };

  if (user.role !== 'admin') {
    bookingQuery.userId = user.userId;
  }

  const booking = await Booking.findOne(bookingQuery);
  if (!booking) {
    throw new NotFoundError('Ticket or booking record not found.');
  }

  // 3. Dynamically synthesize and upsert Ticket record from stored booking info
  const fromLoc = booking.from_location || booking.origin || 'Source';
  const toLoc = booking.to_location || booking.destination || 'Destination';
  const pickup = booking.pickup_point || booking.boardingPoint || 'Main Stand';
  const drop = booking.drop_point || booking.droppingPoint || 'City Drop';

  const synthesizedTicket = await Ticket.findOneAndUpdate(
    { bookingId: booking._id },
    {
      $set: {
        bookingId: booking._id,
        pnr: booking.pnr || booking.bookingReference || `YATRA-${Date.now().toString().slice(-6)}`,
        journeySnapshot: {
          busName: booking.busName || 'YatraBus Express',
          busNumber: booking.busNumber || 'N/A',
          busType: booking.busType || 'AC Luxury Coach',
          source: fromLoc,
          destination: toLoc,
          from_location: fromLoc,
          to_location: toLoc,
          travelDate: booking.journeyDate,
          departureTime: booking.departureTime || '20:00',
          arrivalTime: booking.arrivalTime || '06:00',
          boardingPoint: pickup,
          droppingPoint: drop,
          pickup_point: pickup,
          drop_point: drop,
          latitude: booking.latitude,
          longitude: booking.longitude,
        },
        passengerSnapshot: (booking.passengers && booking.passengers.length > 0)
          ? booking.passengers
          : (booking.seats || []).map((s) => ({
              name: 'Passenger',
              age: 28,
              gender: 'male',
              seatNumber: s,
            })),
        seats: booking.seats || [],
        priceBreakdown: booking.priceBreakdown || {
          basePrice: booking.totalFare || 0,
          additionalCharges: 0,
          taxAmount: 0,
          totalAmount: booking.totalFare || 0,
        },
        paymentStatus: booking.paymentStatus === 'paid' ? 'Successful' : (booking.paymentStatus || 'Successful'),
        status: booking.bookingStatus || 'confirmed',
        generatedAt: booking.createdAt || new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return synthesizedTicket;
}

export async function getTicketById(req, res, next) {
  try {
    const identifier = req.params.id || req.params.pnr;
    const ticket = await findOrCreateOwnedTicket(identifier, req.user);

    res.status(200).json({
      success: true,
      data: normalizeTicket(ticket),
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketByPnr(req, res, next) {
  try {
    const { pnr } = req.params;
    const ticket = await findOrCreateOwnedTicket(pnr, req.user);

    res.status(200).json({
      success: true,
      data: normalizeTicket(ticket),
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadTicketPdf(req, res, next) {
  try {
    const identifier = req.params.pnr || req.params.id;
    const ticket = await findOrCreateOwnedTicket(identifier, req.user);

    const pdfBuffer = await generateTicketPdf(normalizeTicket(ticket));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticket.pnr || 'yatrabus'}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
