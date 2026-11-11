import { Router } from 'express';
import { getRoutes, getRouteById, createRoute } from '../controllers/routeController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

router.get('/', getRoutes);
router.get('/:id', getRouteById);
router.post('/', authenticate, requireAdmin, createRoute);

export default router;
