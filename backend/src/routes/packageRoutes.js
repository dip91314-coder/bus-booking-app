import { Router } from 'express';
import {
  getPackages,
  getPackageBySlug,
  getAdminPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/packageController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Public routes
router.get('/', getPackages);
router.get('/:slug', getPackageBySlug);

// Admin-protected routes
router.get('/admin/all', authenticate, requireAdmin, getAdminPackages);
router.post('/admin', authenticate, requireAdmin, createPackage);
router.put('/admin/:id', authenticate, requireAdmin, updatePackage);
router.delete('/admin/:id', authenticate, requireAdmin, deletePackage);

export default router;
