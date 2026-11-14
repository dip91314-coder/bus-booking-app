import { Router } from 'express';
import {
  getDashboardMetrics,
  getAllUsers,
  getAllBookings,
  getReports,
  getAdminBuses,
  createAdminBus,
  updateAdminBus,
  deleteAdminBus,
  getAdminRoutes,
  createAdminRoute,
  updateAdminRoute,
  deleteAdminRoute,
  getAdminSchedules,
  createAdminSchedule,
  updateAdminSchedule,
  deleteAdminSchedule,
  cancelAdminBooking,
  getAdminPassengers,
  updateAdminPassenger,
  toggleAdminPassengerStatus,
  getAdminDrivers,
  createAdminDriver,
  updateAdminDriver,
  deleteAdminDriver,
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
  getAdminPayments,
  processAdminRefund,
  getAdminOffers,
  createAdminOffer,
  updateAdminOffer,
  deleteAdminOffer,
  getAdminReviews,
  updateAdminReviewStatus,
  deleteAdminReview,
  getAdminNotifications,
  createAdminNotification,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
  getAdminSettings,
  updateAdminSettings,
  changeAdminPassword,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validateBody } from '../middleware/validate.js';
import {
  adminBusSchema,
  adminBusUpdateSchema,
  adminRouteSchema,
  adminRouteUpdateSchema,
  adminScheduleSchema,
  adminScheduleUpdateSchema,
  adminDriverSchema,
  adminDriverUpdateSchema,
  adminStaffSchema,
  adminStaffUpdateSchema,
  adminOfferSchema,
  adminOfferUpdateSchema,
  adminNotificationSchema,
  adminSettingsSchema,
  adminPasswordSchema,
  adminBookingCancellationSchema,
} from '../validators/adminSchemas.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardMetrics);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.post('/bookings/:id/cancel', validateBody(adminBookingCancellationSchema), cancelAdminBooking);
router.get('/reports', getReports);

router.get('/buses', getAdminBuses);
router.post('/buses', validateBody(adminBusSchema), createAdminBus);
router.put('/buses/:id', validateBody(adminBusUpdateSchema), updateAdminBus);
router.delete('/buses/:id', deleteAdminBus);

router.get('/routes', getAdminRoutes);
router.post('/routes', validateBody(adminRouteSchema), createAdminRoute);
router.put('/routes/:id', validateBody(adminRouteUpdateSchema), updateAdminRoute);
router.delete('/routes/:id', deleteAdminRoute);

router.get('/schedules', getAdminSchedules);
router.post('/schedules', validateBody(adminScheduleSchema), createAdminSchedule);
router.put('/schedules/:id', validateBody(adminScheduleUpdateSchema), updateAdminSchedule);
router.delete('/schedules/:id', deleteAdminSchedule);

router.get('/passengers', getAdminPassengers);
router.put('/passengers/:id', validateBody(z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().min(7).optional(),
  city: z.string().trim().optional(),
}).refine((fields) => Object.keys(fields).length > 0, 'At least one field must be provided')), updateAdminPassenger);
router.patch('/passengers/:id/status', toggleAdminPassengerStatus);

router.get('/drivers', getAdminDrivers);
router.post('/drivers', validateBody(adminDriverSchema), createAdminDriver);
router.put('/drivers/:id', validateBody(adminDriverUpdateSchema), updateAdminDriver);
router.delete('/drivers/:id', deleteAdminDriver);

router.get('/staff', getAdminStaff);
router.post('/staff', validateBody(adminStaffSchema), createAdminStaff);
router.put('/staff/:id', validateBody(adminStaffUpdateSchema), updateAdminStaff);
router.delete('/staff/:id', deleteAdminStaff);

router.get('/payments', getAdminPayments);
router.post('/payments/:id/refund', processAdminRefund);

router.get('/offers', getAdminOffers);
router.post('/offers', validateBody(adminOfferSchema), createAdminOffer);
router.put('/offers/:id', validateBody(adminOfferUpdateSchema), updateAdminOffer);
router.delete('/offers/:id', deleteAdminOffer);

router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/status', validateBody(z.object({
  status: z.enum(['Published', 'Under Review', 'Flagged']),
})), updateAdminReviewStatus);
router.delete('/reviews/:id', deleteAdminReview);

router.get('/notifications', getAdminNotifications);
router.post('/notifications', validateBody(adminNotificationSchema), createAdminNotification);
router.patch('/notifications/read-all', markAllAdminNotificationsRead);
router.patch('/notifications/:id/read', markAdminNotificationRead);
router.delete('/notifications/:id', deleteAdminNotification);

router.get('/settings', getAdminSettings);
router.put('/settings', validateBody(adminSettingsSchema), updateAdminSettings);
router.post('/change-password', validateBody(adminPasswordSchema), changeAdminPassword);

export default router;
