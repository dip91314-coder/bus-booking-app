import express from 'express';
import {
  getTicketById,
  getTicketByPnr,
  downloadTicketPdf,
} from '../controllers/ticketController.js';

const router = express.Router();

router.get('/:id', getTicketById);
router.get('/pnr/:pnr', getTicketByPnr);
router.get('/:id/pdf', downloadTicketPdf);
router.get('/pnr/:pnr/pdf', downloadTicketPdf);

export default router;
