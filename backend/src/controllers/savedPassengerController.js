import { SavedPassenger } from '../models/SavedPassenger.js';
import { NotFoundError } from '../utils/customErrors.js';

export async function getSavedPassengers(req, res, next) {
  try {
    const passengers = await SavedPassenger.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: passengers.length,
      data: passengers,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSavedPassenger(req, res, next) {
  try {
    const passenger = await SavedPassenger.create({
      ...req.body,
      userId: req.user.userId,
    });
    res.status(201).json({
      success: true,
      data: passenger,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSavedPassenger(req, res, next) {
  try {
    const passenger = await SavedPassenger.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!passenger) {
      throw new NotFoundError('Saved passenger not found');
    }
    res.status(200).json({
      success: true,
      message: 'Saved passenger removed',
    });
  } catch (error) {
    next(error);
  }
}
