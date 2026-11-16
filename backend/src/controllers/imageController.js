import { env } from '../config/env.js';
import { AppError, ValidationError } from '../utils/customErrors.js';
import { searchUnsplashPhoto } from '../services/unsplashImageService.js';

export async function searchUnsplashImages(req, res, next) {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (!query || query.length > 120) {
      throw new ValidationError('A destination search query between 1 and 120 characters is required.');
    }
    if (!env.UNSPLASH_ACCESS_KEY) {
      throw new AppError('Unsplash image search is not configured. Set UNSPLASH_ACCESS_KEY on the backend.', 503);
    }

    const photo = await searchUnsplashPhoto(query, env.UNSPLASH_ACCESS_KEY);
    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    next(error);
  }
}
