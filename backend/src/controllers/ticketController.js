import mongoose from 'mongoose';
import { Ticket, Booking } from '../models/index.js';
import { generateTicketPdf } from '../services/pdfTicketService.js';
import { NotFoundError, UnauthorizedError } from '../utils/customErrors.js';
import { normalizeYatraBus } from '../utils/yatraFleet.js';
import { publishUserNotification } from '../services/notificationService.js';

function normalizeTicket(ticket) {
  const value = typeof ticket.toObject === 'function' ? ticket.toObject() : ticket;
  return {
    ...value,
    journeySnapshot: {
      ...value.journeySnapshot,
      busName: normalizeYatraBus(value.journeySnapshot || {}).busName,
    },
  };
}

function buildTicketFromBooking(booking) {
  return {
    _id: booking._id,
    bookingId: booking._id,
    pnr: booking.pnr || booking.bookingReference,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    generatedAt: booking.bookedAt || booking.createdAt,
    journeySnapshot: {
      busName: booking.busName,
      busNumber: booking.busNumber,
      busType: booking.busType,
      source: booking.origin,
      destination: booking.destination,
      from_location: booking.from_location,
      to_location: booking.to_location,
      travelDate: booking.journeyDate,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      boardingPoint: booking.boardingPoint,
      droppingPoint: booking.droppingPoint,
      pickup_point: booking.pickup_point,
      drop_point: booking.drop_point,
    },
    passengerSnapshot: booking.passengers || [],
    seats: booking.seats || [],
    priceBreakdown: {
      ...(booking.priceBreakdown?.toObject?.() || booking.priceBreakdown || {}),
      totalAmount: booking.priceBreakdown?.totalAmount || booking.totalFare || 0,
    },
  };
}

function identifierQuery(identifier) {
  const normalizedPnr = identifier.toUpperCase();
  const clauses = [{ bookingReference: normalizedPnr }, { pnr: normalizedPnr }];
  if (mongoose.isValidObjectId(identifier)) clauses.push({ _id: identifier });
  return { $or: clauses };
}

async function findOwnedTicket(identifier, user) {
  const ticketQuery = mongoose.isValidObjectId(identifier)
    ? { $or: [{ _id: identifier }, { bookingId: identifier }, { pnr: identifier.toUpperCase() }] }
    : { pnr: identifier.toUpperCase() };

  const bookingAccess = {
    bookingStatus: { $in: ['confirmed', 'completed'] },
    ...(user.role === 'admin' ? {} : { userId: user.userId }),
  };
  const savedTicket = await Ticket.findOne(ticketQuery);
  if (savedTicket) {
    const booking = await Booking.findOne({ _id: savedTicket.bookingId, ...bookingAccess });
    if (!booking) throw new NotFoundError('Ticket not found.');
    return { ticket: normalizeTicket(savedTicket), booking };
  }

  const booking = await Booking.findOne({ ...identifierQuery(identifier), ...bookingAccess });
  if (!booking) throw new NotFoundError('Ticket not found.');
  return { ticket: normalizeTicket(buildTicketFromBooking(booking)), booking };
}

export async function getTicketById(req, res, next) {
  try {
    const identifier = req.params.id || req.params.pnr;
    if (!identifier) throw new NotFoundError('Ticket identifier is required.');

    const { ticket } = await findOwnedTicket(identifier, req.user);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function getTicketByPnr(req, res, next) {
  try {
    const { pnr } = req.params;
    if (!pnr) throw new NotFoundError('PNR is required.');

    const { ticket } = await findOwnedTicket(pnr, req.user);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function downloadTicketPdf(req, res, next) {
  try {
    const identifier = req.params.pnr || req.params.id;
    if (!identifier) throw new NotFoundError('Ticket identifier is required.');

    const { ticket, booking } = await findOwnedTicket(identifier, req.user);
    const pdfBuffer = await generateTicketPdf({
      ...ticket,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
    });

    if (req.user.role !== 'admin') {
      await publishUserNotification({
        userId: booking.userId,
        tripId: booking.tripId,
        bookingId: booking._id,
        category: 'ticket',
        title: 'Ticket downloaded',
        message: `Your ticket for booking ${ticket.pnr || booking.bookingReference} is ready to print.`,
      });
    }

    const safePnr = String(ticket.pnr || booking.bookingReference).replace(/[^a-zA-Z0-9_-]/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${safePnr}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
