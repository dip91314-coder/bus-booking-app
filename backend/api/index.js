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
      if (env.MONGO_URI) {
        try {
          await connectDB();
          await seedDefaults();
        } catch (err) {
          logger.error({ err: err?.message }, 'Serverless MongoDB connection warning');
        }
      } else {
        logger.warn('MONGO_URI is not set in Vercel Environment Variables.');
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

  return app(req, res);
}
