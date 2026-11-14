import { Router } from 'express';
import { createBooking, getMyBookings, getBookingByReference, cancelBooking } from '../controllers/bookingController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createBookingSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', optionalAuthenticate, validateBody(createBookingSchema), createBooking);
router.get('/my-bookings', authenticate, getMyBookings);
router.get('/:reference', authenticate, getBookingByReference);
router.post('/:id/cancel', authenticate, cancelBooking);

export default router;
