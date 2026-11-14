import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { cleanupExpiredLocks } from './services/seatLockService.js';

async function bootstrap() {
  try {
    await connectDB();

    const app = createApp();

    // Background sweeper to expire abandoned seat locks every 60 seconds
    const lockSweeper = setInterval(cleanupExpiredLocks, 60 * 1000);

    const server = app.listen(env.PORT, () => {
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
  } catch (error) {
    logger.fatal({ error }, 'Failed to initialize server application');
    process.exit(1);
  }
}

bootstrap();
