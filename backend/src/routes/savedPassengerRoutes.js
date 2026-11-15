import { Router } from 'express';
import {
  getSavedPassengers,
  createSavedPassenger,
  deleteSavedPassenger,
} from '../controllers/savedPassengerController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getSavedPassengers);
router.post('/', createSavedPassenger);
router.delete('/:id', deleteSavedPassenger);

export default router;
