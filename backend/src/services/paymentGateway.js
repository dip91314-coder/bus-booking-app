import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class MockPaymentGateway {
  constructor(keyId = 'rzp_test_mock_key_id', keySecret = 'rzp_test_mock_secret') {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createOrder({ amount, currency = 'INR', receipt }) {
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    logger.info({ orderId, amount, receipt }, 'Mock gateway created payment order');
    return {
      id: orderId,
      entity: 'order',
      amount: Math.round(amount * 100), // in paise
      currency,
      receipt,
      status: 'created',
      key: this.keyId,
    };
  }

  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!signature || !orderId || !paymentId) return false;
    // Standard HMAC SHA256 verification (same algorithm as Razorpay)
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  generateSignature(orderId, paymentId) {
    return crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  verifyWebhookSignature({ rawBody, signature, secret = env.RAZORPAY_WEBHOOK_SECRET }) {
    if (!signature || !rawBody) return false;
    const bodyStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const expected = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }
}

// Singleton default gateway instance
export const paymentGateway = new MockPaymentGateway(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);
