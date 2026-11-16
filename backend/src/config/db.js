import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const MAX_RETRIES = isServerless ? 2 : 5;
const RETRY_INTERVAL_MS = isServerless ? 1000 : 3000;
let indexesSynced = false;

export async function connectDB(uri) {
  // If connection is already open, reuse it (crucial for serverless environments)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is currently in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', resolve);
    });
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
  }

  const connectionUri = uri || env.MONGO_URI || env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!connectionUri) {
    logger.warn('MONGO_URI / MONGODB_URI is not defined. Skipping database connection.');
    return null;
  }

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      logger.info({ attempt, maxRetries: MAX_RETRIES }, 'Connecting to MongoDB...');
      await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: isServerless ? 4000 : 5000,
        autoIndex: !isServerless,
      });
      logger.info('✅ Successfully connected to MongoDB');

      // Guarantee unique indexes are synced once per process lifetime
      if (!indexesSynced) {
        try {
          const { SeatReservation, Booking, Trip } = await import('../models/index.js');
          await Promise.all([
            SeatReservation.syncIndexes(),
            Booking.syncIndexes(),
            Trip.syncIndexes(),
          ]);
          indexesSynced = true;
          logger.info('✅ Database indexes synchronized');
        } catch (idxErr) {
          logger.warn({ err: idxErr?.message }, 'Index synchronization warning');
        }
      }
      return mongoose.connection;
    } catch (error) {
      logger.error({ error: error.message, attempt }, '❌ MongoDB connection attempt failed');
      if (attempt < MAX_RETRIES) {
        logger.info(`Retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      } else {
        logger.error('Could not connect to MongoDB after maximum attempts.');
        if (!isServerless) {
          throw error;
        }
        return null;
      }
    }
  }
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    indexesSynced = false;
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error({ error }, 'Error closing MongoDB connection');
  }
}
