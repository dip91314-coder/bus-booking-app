import { Router } from 'express';
import { getBuses, getBusById, createBus, updateBus, deleteBus } from '../controllers/busController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { createBusSchema, busQuerySchema } from '../validators/schemas.js';

const router = Router();

router.get('/', validateQuery(busQuerySchema), getBuses);
router.get('/:id', getBusById);
router.post('/', authenticate, requireAdmin, validateBody(createBusSchema), createBus);
router.put('/:id', authenticate, requireAdmin, updateBus);
router.delete('/:id', authenticate, requireAdmin, deleteBus);

export default router;
