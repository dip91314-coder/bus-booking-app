import mongoose from 'mongoose';

const CancellationSchema = new mongoose.Schema(
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
    bookingReference: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      default: 'Change of travel plans',
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundStatus: {
      type: String,
      enum: ['initiated', 'processed', 'failed'],
      default: 'processed',
    },
    cancellationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Cancellation =
  mongoose.models.Cancellation || mongoose.model('Cancellation', CancellationSchema);
