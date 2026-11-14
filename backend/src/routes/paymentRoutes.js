import express from 'express';
import {
  initiatePaymentHandler,
  verifyPaymentHandler,
  webhookHandler,
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Customer Payment Initiation & Verification
router.post('/initiate', requireAuth, initiatePaymentHandler);
router.post('/verify', verifyPaymentHandler);
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

export default router;
