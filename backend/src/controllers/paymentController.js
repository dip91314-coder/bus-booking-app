import { initiatePayment, confirmPayment } from '../services/paymentService.js';
import { paymentGateway } from '../services/paymentGateway.js';
import { ValidationError } from '../utils/customErrors.js';
import { logger } from '../config/logger.js';

export async function initiatePaymentHandler(req, res, next) {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.userId || req.user?._id;

    if (!bookingId) {
      throw new ValidationError('bookingId is required to initiate payment.');
    }

    const result = await initiatePayment({ bookingId, userId });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPaymentHandler(req, res, next) {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId) {
      throw new ValidationError('orderId and paymentId are required to verify payment.');
    }

    const result = await confirmPayment({
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      rawPayload: req.body,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function webhookHandler(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    const isValid = paymentGateway.verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      logger.warn({ signature }, 'Invalid webhook signature received');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Extract payment details if payment.captured event
    const payload = req.body?.payload?.payment?.entity;
    if (payload) {
      await confirmPayment({
        gatewayOrderId: payload.order_id,
        gatewayPaymentId: payload.id,
        rawPayload: req.body,
      });
    }

    res.status(200).json({ success: true, status: 'ok' });
  } catch (error) {
    next(error);
  }
}
