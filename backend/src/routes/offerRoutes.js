import { Router } from 'express';
import { getActiveOffers, validateOffer } from '../controllers/offerController.js';

const router = Router();

router.get('/', getActiveOffers);
router.post('/validate', validateOffer);

export default router;
