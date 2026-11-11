import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

export async function connectDB(): Promise<void> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      logger.info({ attempt, maxRetries: MAX_RETRIES }, 'Connecting to MongoDB...');
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('✅ Successfully connected to MongoDB');
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

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error({ error }, 'Error closing MongoDB connection');
  }
}
