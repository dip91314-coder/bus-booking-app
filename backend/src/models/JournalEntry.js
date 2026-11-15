import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    story: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    },
    prints: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    notes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const JournalEntry =
  mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
