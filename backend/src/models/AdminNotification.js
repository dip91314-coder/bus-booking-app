import mongoose from 'mongoose';

const AdminNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['booking', 'payment', 'cancellation', 'alert'],
      default: 'alert',
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AdminNotification =
  mongoose.models.AdminNotification || mongoose.model('AdminNotification', AdminNotificationSchema);
