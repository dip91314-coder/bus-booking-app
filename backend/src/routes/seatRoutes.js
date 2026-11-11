import { Router } from 'express';
import { getSeatsByBus, holdSeats, releaseSeats } from '../controllers/seatController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { holdSeatSchema } from '../validators/schemas.js';

const router = Router();

router.get('/:busId', getSeatsByBus);
router.post('/hold', authenticate, validateBody(holdSeatSchema), holdSeats);
router.post('/release', authenticate, releaseSeats);

export default router;
