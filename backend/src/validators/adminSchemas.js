import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'A valid resource ID is required');
const status = (values) => z.enum(values);
const nonEmptyUpdate = (schema) =>
  schema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

export const adminBusSchema = z.object({
  busNumber: z.string().trim().min(4),
  busName: z.string().trim().min(2),
  operator: z.string().trim().min(2),
  busType: z.string().trim().min(2),
  isAc: z.boolean(),
  capacity: z.coerce.number().int().min(1).max(100),
  fare: z.coerce.number().min(1),
  origin: z.string().trim().min(2),
  destination: z.string().trim().min(2),
  departureTime: z.string().trim().min(1),
  arrivalTime: z.string().trim().min(1),
  status: status(['Active', 'Maintenance', 'Inactive']),
  amenities: z.array(z.string()).default([]),
  rating: z.coerce.number().min(0).max(5).optional(),
  assignedDriver: z.string().trim().optional(),
  lastServiceDate: z.string().trim().optional(),
});

export const adminBusUpdateSchema = nonEmptyUpdate(adminBusSchema);

export const adminRouteSchema = z.object({
  source: z.string().trim().min(2),
  destination: z.string().trim().min(2),
  distance: z.string().trim().min(1).refine(
    (value) => Number.isFinite(Number.parseFloat(value)),
    'Distance must include a numeric value'
  ),
  duration: z.string().trim().min(1),
  highway: z.string().trim().optional(),
  stops: z.array(z.string()).default([]),
  activeBusesCount: z.coerce.number().int().min(0).default(0),
  baseFare: z.coerce.number().min(0),
  status: status(['Active', 'Inactive']).default('Active'),
});

export const adminRouteUpdateSchema = nonEmptyUpdate(adminRouteSchema);

export const adminScheduleSchema = z.object({
  busId: objectId,
  routeId: objectId,
  journeyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: z.string().min(1),
  arrivalTime: z.string().min(1),
  fare: z.coerce.number().min(1),
  availableSeats: z.coerce.number().int().min(0),
  totalSeats: z.coerce.number().int().min(1),
  status: status(['Scheduled', 'On Route', 'Completed', 'Cancelled']).default('Scheduled'),
});

export const adminScheduleUpdateSchema = nonEmptyUpdate(adminScheduleSchema);

export const adminDriverSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  licenseNumber: z.string().trim().min(4),
  experienceYears: z.coerce.number().int().min(1),
  busId: z.preprocess((value) => value === '' ? null : value, objectId.nullable()).optional(),
  status: status(['Available', 'On Journey', 'On Leave']).default('Available'),
});

export const adminDriverUpdateSchema = nonEmptyUpdate(adminDriverSchema);

export const adminStaffSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(7),
  role: z.string().trim().min(2),
  branch: z.string().trim().min(2),
  status: status(['Active', 'Inactive']).default('Active'),
});

export const adminStaffUpdateSchema = nonEmptyUpdate(adminStaffSchema);

export const adminOfferSchema = z.object({
  code: z.string().trim().min(2),
  title: z.string().trim().min(2),
  discountPercentage: z.coerce.number().min(1).max(100),
  maxDiscount: z.coerce.number().min(0).default(0),
  minBookingAmount: z.coerce.number().min(0).default(0),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  usageLimit: z.coerce.number().int().min(0).default(0),
  description: z.string().trim().optional(),
  status: status(['Active', 'Disabled', 'Expired']).default('Active'),
});

export const adminOfferUpdateSchema = nonEmptyUpdate(adminOfferSchema);

export const adminNotificationSchema = z.object({
  title: z.string().trim().min(1),
  message: z.string().trim().min(1),
  category: status(['booking', 'payment', 'cancellation', 'alert']).default('alert'),
});

export const adminSettingsSchema = z.object({
  adminName: z.string().trim().min(2).optional(),
  adminEmail: z.string().email().optional(),
  adminPhone: z.string().trim().min(7).optional(),
  adminRole: z.string().trim().min(2).optional(),
  platformTitle: z.string().trim().min(2).optional(),
  currency: z.string().trim().min(1).optional(),
  taxGstRate: z.coerce.number().min(0).max(100).optional(),
  supportEmail: z.string().email().optional(),
  supportHelpline: z.string().trim().min(3).optional(),
  maintenanceMode: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  soundAlerts: z.boolean().optional(),
}).refine((settings) => Object.keys(settings).length > 0, 'At least one setting must be provided');

export const adminPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const adminBookingCancellationSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
