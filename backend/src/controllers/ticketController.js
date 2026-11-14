import mongoose from 'mongoose';
import { Ticket, Booking } from '../models/index.js';
import { generateTicketPdf } from '../services/pdfTicketService.js';
import { NotFoundError } from '../utils/customErrors.js';

export async function getTicketById(req, res, next) {
  try {
    const identifier = req.params.id || req.params.pnr;
    if (!identifier) {
      throw new NotFoundError('Ticket identifier is required.');
    }

    const query = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { bookingId: identifier }, { pnr: identifier.toUpperCase() }] }
      : { pnr: identifier.toUpperCase() };

    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new NotFoundError(`Ticket not found for identifier ${identifier}.`);
    }

    res.status(200).json({
      success: true,
      data: ticket,
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

    const ticket = await Ticket.findOne({ pnr: pnr.toUpperCase() });
    if (!ticket) {
      throw new NotFoundError(`Ticket with PNR ${pnr} not found.`);
    }

    res.status(200).json({
      success: true,
      data: ticket,
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

    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new NotFoundError(`Ticket not found for identifier ${identifier}.`);
    }

    const pdfBuffer = await generateTicketPdf(ticket);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticket.pnr}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
