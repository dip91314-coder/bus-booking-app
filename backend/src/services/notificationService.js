import { TripNotification } from '../models/TripNotification.js';
import { logger } from '../config/logger.js';

export async function publishUserNotification({
  userId,
  tripId,
  bookingId,
  type = 'GENERAL',
  category = 'alert',
  title,
  message,
}) {
  try {
    return await TripNotification.create({
      userId,
      tripId,
      bookingId,
      type,
      category,
      title,
      message,
    });
  } catch (error) {
    logger.error(
      { err: error, userId, bookingId, category },
      'Failed to persist customer notification'
    );
    return null;
  }
}
