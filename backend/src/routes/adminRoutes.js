import { Router } from 'express';
import {
  getDashboardMetrics,
  getAllUsers,
  getAllBookings,
  getReports,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Protect all admin routes with authentication and requireAdmin
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardMetrics);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.get('/reports', getReports);

export default router;
