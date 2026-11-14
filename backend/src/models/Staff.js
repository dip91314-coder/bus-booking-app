import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    joinedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
