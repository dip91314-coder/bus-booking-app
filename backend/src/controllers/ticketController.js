import mongoose from 'mongoose';
import { Ticket, Booking } from '../models/index.js';
import { generateTicketPdf } from '../services/pdfTicketService.js';
import { NotFoundError } from '../utils/customErrors.js';
import { normalizeYatraBus } from '../utils/yatraFleet.js';

function normalizeTicket(ticket) {
  const value = ticket.toObject();
  return {
    ...value,
    journeySnapshot: {
      ...value.journeySnapshot,
      busName: normalizeYatraBus(value.journeySnapshot).busName,
    },
  };
}

async function findOwnedTicket(query, user) {
  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    throw new NotFoundError('Ticket not found.');
  }

  const bookingQuery = {
    _id: ticket.bookingId,
    bookingStatus: { $nin: ['cancelled', 'failed', 'expired'] },
  };
  if (user.role !== 'admin') {
    bookingQuery.userId = user.userId;
  }
  const booking = await Booking.findOne(bookingQuery).select('_id');
  if (!booking) {
    throw new NotFoundError('Ticket not found.');
  }

  return ticket;
}

export async function getTicketById(req, res, next) {
  try {
    const identifier = req.params.id || req.params.pnr;
    if (!identifier) {
      throw new NotFoundError('Ticket identifier is required.');
    }

    const query = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { bookingId: identifier }, { pnr: identifier.toUpperCase() }] }
      : { pnr: identifier.toUpperCase() };

    const ticket = await findOwnedTicket(query, req.user);

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
    if (!pnr) {
      throw new NotFoundError('PNR is required.');
    }

    const ticket = await findOwnedTicket({ pnr: pnr.toUpperCase() }, req.user);

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
    if (!identifier) {
      throw new NotFoundError('Ticket identifier is required.');
    }

    const query = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { bookingId: identifier }, { pnr: identifier.toUpperCase() }] }
      : { pnr: identifier.toUpperCase() };

    const ticket = await findOwnedTicket(query, req.user);

    const pdfBuffer = await generateTicketPdf(normalizeTicket(ticket));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticket.pnr}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
