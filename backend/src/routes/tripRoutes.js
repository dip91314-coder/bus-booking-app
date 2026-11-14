import express from 'express';
import {
  searchTrips,
  getTripById,
  getTripSeatsHandler,
  lockSeatsHandler,
  releaseLocksHandler,
} from '../controllers/tripController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public Trip Discovery
router.get('/', searchTrips);
router.get('/:id', getTripById);
router.get('/:tripId/seats', getTripSeatsHandler);

// Authenticated Seat Locking & Release
router.post('/:tripId/locks', requireAuth, lockSeatsHandler);
router.post('/:tripId/locks/release', requireAuth, releaseLocksHandler);

export default router;
