import mongoose from 'mongoose';

const PlatformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'platform' },
    values: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
  },
  { timestamps: true }
);

export const PlatformSettings =
  mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', PlatformSettingsSchema);
