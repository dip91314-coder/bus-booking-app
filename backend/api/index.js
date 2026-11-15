import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { seedDefaults } from '../src/scripts/seedDefaults.js';
import { env } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';

let app = null;
let dbPromise = null;

async function ensureDatabaseConnected() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const uri = env.MONGO_URI || env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
      if (uri) {
        try {
          await connectDB(uri);
          await seedDefaults();
        } catch (err) {
          logger.error({ err: err?.message }, 'Serverless MongoDB connection warning');
        }
      } else {
        logger.warn('MONGO_URI / MONGODB_URI is not set in Vercel Environment Variables.');
      }
    })();
  }
  await dbPromise;
}

export default async function handler(req, res) {
  await ensureDatabaseConnected();

  if (!app) {
    app = createApp();
  }

  // Restore the client's original requested route if rewritten by Vercel
  const originalUrl = req.headers['x-matched-path'] || req.headers['x-forwarded-url'] || req.headers['x-vercel-matched-path'];
  if (originalUrl && (req.url === '/api' || req.url === '/api/' || req.url === '/api/index.js')) {
    req.url = originalUrl;
  }

  return app(req, res);
}
