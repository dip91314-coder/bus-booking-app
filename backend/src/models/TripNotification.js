import mongoose from 'mongoose';

const TripNotificationSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['DELAY', 'CANCELLATION', 'SCHEDULE_CHANGE', 'GENERAL'],
      default: 'GENERAL',
      index: true,
    },
    category: {
      type: String,
      enum: ['booking', 'payment', 'cancellation', 'ticket', 'schedule', 'alert'],
      default: 'alert',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

TripNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const TripNotification =
  mongoose.models.TripNotification || mongoose.model('TripNotification', TripNotificationSchema);
