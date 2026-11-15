import { Router } from 'express';
import {
  getMyJournal,
  createJournalEntry,
  deleteJournalEntry,
} from '../controllers/journalController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMyJournal);
router.post('/', createJournalEntry);
router.delete('/:id', deleteJournalEntry);

export default router;
