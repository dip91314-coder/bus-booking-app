import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    gateway: {
      type: String,
      enum: ['Razorpay', 'Mock', 'Stripe', 'Manual'],
      default: 'Mock',
      index: true,
    },
    gatewayOrderId: {
      type: String,
      trim: true,
      index: true,
    },
    gatewayPaymentId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true, // Idempotency: gateway payment ID must never be processed twice
      index: true,
    },
    gatewaySignature: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: 'UPI',
    },
    transactionReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['success', 'successful', 'pending', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    refundStatus: {
      type: String,
      enum: ['None', 'Requested', 'Processed', 'refund_required'],
      default: 'None',
      index: true,
    },
    rawWebhookPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ bookingId: 1, createdAt: -1 });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
