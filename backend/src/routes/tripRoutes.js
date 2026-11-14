import express from 'express';
import {
  searchTrips,
  getTripById,
  getTripSeatsHandler,
  lockSeatsHandler,
  releaseLocksHandler,
} from '../controllers/tripController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { tripQuerySchema } from '../validators/schemas.js';

const router = express.Router();

// Public Trip Discovery
router.get('/', validateQuery(tripQuerySchema), searchTrips);
router.get('/:id', getTripById);
router.get('/:tripId/seats', getTripSeatsHandler);

// Authenticated Seat Locking & Release
router.post('/:tripId/locks', requireAuth, lockSeatsHandler);
router.post('/:tripId/locks/release', requireAuth, releaseLocksHandler);

export default router;
