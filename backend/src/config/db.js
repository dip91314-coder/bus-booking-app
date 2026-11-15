import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

export async function connectDB() {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      logger.info({ attempt, maxRetries: MAX_RETRIES }, 'Connecting to MongoDB...');
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true,
      });
      logger.info('✅ Successfully connected to MongoDB');

      // Guarantee unique indexes are synced in the database
      try {
        const { SeatReservation, Booking, Trip } = await import('../models/index.js');
        await Promise.all([
          SeatReservation.syncIndexes(),
          Booking.syncIndexes(),
          Trip.syncIndexes(),
        ]);
        logger.info('✅ Database indexes synchronized');
      } catch (idxErr) {
        logger.warn({ err: idxErr?.message }, 'Index synchronization warning');
      }
      return;
    } catch (error) {
      logger.error({ error, attempt }, '❌ MongoDB connection attempt failed');
      if (attempt < MAX_RETRIES) {
        logger.info(`Retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      } else {
        logger.fatal('Could not connect to MongoDB after maximum attempts. Exiting process.');
        throw error;
      }
    }
  }
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error({ error }, 'Error closing MongoDB connection');
  }
}
