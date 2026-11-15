import { JournalEntry } from '../models/JournalEntry.js';
import { NotFoundError } from '../utils/customErrors.js';

export async function getMyJournal(req, res, next) {
  try {
    const entries = await JournalEntry.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
}

export async function createJournalEntry(req, res, next) {
  try {
    const entry = await JournalEntry.create({
      ...req.body,
      userId: req.user.userId,
    });
    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJournalEntry(req, res, next) {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }
    res.status(200).json({
      success: true,
      message: 'Journal memory deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
