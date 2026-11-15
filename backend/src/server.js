import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { cleanupExpiredLocks } from './services/seatLockService.js';
import { seedDefaults } from './scripts/seedDefaults.js';

let app = null;

export function getApp() {
  if (!app) {
    app = createApp();
  }
  return app;
}

export async function bootstrap() {
  try {
    const mongoUri = env.MONGO_URI || env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
    if (mongoUri) {
      await connectDB(mongoUri);
      await seedDefaults();
    } else {
      logger.warn('MONGO_URI is not set. Starting in non-connected fallback mode.');
    }

    const application = getApp();

    // Background sweeper to expire abandoned seat locks every 60 seconds
    const lockSweeper = setInterval(cleanupExpiredLocks, 60 * 1000);

    const server = application.listen(env.PORT, () => {
      logger.info(`YatraBus Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);
      clearInterval(lockSweeper);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    return server;
  } catch (error) {
    logger.fatal({ error }, 'Failed to initialize server application');
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

// Only auto-listen if running as a persistent Node server (not in serverless Lambda / Vercel)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  bootstrap();
}

export default getApp();
