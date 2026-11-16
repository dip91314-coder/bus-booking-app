import { Router } from 'express';
import {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destinationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);

// Admin-only mutations
router.post('/', authenticate, requireAdmin, createDestination);
router.put('/:id', authenticate, requireAdmin, updateDestination);
router.delete('/:id', authenticate, requireAdmin, deleteDestination);

export default router;
