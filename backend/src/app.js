import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import mongoose from 'mongoose';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { getRedisStatus } from './config/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import { pinoLogger } from './middleware/pinoLogger.js';
import { requestId } from './middleware/requestId.js';
import { authenticate } from './middleware/auth.js';
import { PlatformSettings } from './models/PlatformSettings.js';
import { TripNotification } from './models/TripNotification.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import busRoutes from './routes/busRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import savedPassengerRoutes from './routes/savedPassengerRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadsDir = isServerless
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(__dirname, '../uploads');

export function createApp() {
  const app = express();

  // Trust proxy for Vercel and reverse proxies
  app.set('trust proxy', 1);

  // Serverless lazy DB initialization
  let dbInitPromise = null;
  app.use(async (_req, _res, next) => {
    if (!dbInitPromise) {
      dbInitPromise = (async () => {
        const uri = env.MONGO_URI || env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
        if (uri) {
          try {
            const { connectDB } = await import('./config/db.js');
            const { seedDefaults } = await import('./scripts/seedDefaults.js');
            await connectDB(uri);
            await seedDefaults();
          } catch (err) {
            console.error('Lazy DB connection notice:', err?.message);
          }
        }
      })();
    }
    if (dbInitPromise) {
      await dbInitPromise;
    }
    next();
  });

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = [
    env.CLIENT_URL,
    process.env.CORS_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  });
  app.use('/api/', limiter);
  app.use('/auth/', limiter);

  // Body parser and compression
  app.use(express.json({
    limit: '1mb',
    verify: (req, _res, buffer) => {
      if (req.originalUrl.split('?')[0] === '/api/payments/webhook' || req.originalUrl.split('?')[0] === '/payments/webhook') {
        req.rawBody = Buffer.from(buffer);
      }
    },
  }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(cookieParser());
  app.use(compression());

  // Request correlation and logging
  app.use(requestId);
  if (env.NODE_ENV !== 'test') {
    app.use(pinoLogger);
  }

  // Serve uploaded files statically
  try {
    if (fs.existsSync(uploadsDir)) {
      app.use('/uploads', express.static(uploadsDir));
    }
  } catch {
    // Non-fatal if uploads dir is not accessible
  }

  // Favicon handler to prevent 404s in logs
  app.get('/favicon.ico', (_req, res) => res.status(204).end());

  // Root Welcome & API Status (Accessible at both / and /api)
  const rootStatusHandler = (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
      status: 'online',
      service: 'YatraBus Pan-India Backend API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      database: mongoStatus,
      health: '/api/health',
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/', rootStatusHandler);
  app.get('/api', rootStatusHandler);
  app.get('/api/', rootStatusHandler);

  // Health check (Accessible at both /api/health and /health)
  const healthHandler = (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisStatus = getRedisStatus();
    const isHealthy = mongoStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'YatraBus Pan-India Backend API',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      mongo: mongoStatus,
      redis: redisStatus,
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Public settings endpoint
  const settingsHandler = async (req, res, next) => {
    try {
      const settings = await PlatformSettings.findOne({ key: 'platform' });
      res.status(200).json({
        success: true,
        data: settings?.values || {
          siteName: 'YatraBus',
          brandTagline: 'India\'s Premier Bus Transit Platform',
          supportEmail: 'support@yatrabus.com',
          supportPhone: '+91 98765 43210',
          emergencyHelpline: '1800-200-9287',
        },
      });
    } catch (err) {
      next(err);
    }
  };
  app.get('/api/settings', settingsHandler);
  app.get('/settings', settingsHandler);

  // User notifications endpoint
  const getNotificationsHandler = async (req, res, next) => {
    try {
      const notifs = await TripNotification.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(50);
      res.status(200).json({ success: true, count: notifs.length, data: notifs });
    } catch (err) {
      next(err);
    }
  };
  app.get('/api/notifications', authenticate, getNotificationsHandler);
  app.get('/notifications', authenticate, getNotificationsHandler);

  const readNotificationHandler = async (req, res, next) => {
    try {
      const notif = await TripNotification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { isRead: true },
        { new: true }
      );
      res.status(200).json({ success: true, data: notif });
    } catch (err) {
      next(err);
    }
  };
  app.patch('/api/notifications/:id/read', authenticate, readNotificationHandler);
  app.patch('/notifications/:id/read', authenticate, readNotificationHandler);

  // API Route mounting: mount under both /api/<path> and /<path>
  // This guarantees requests reach endpoints whether VITE_API_URL includes /api or not
  const apiRouters = [
    ['/auth', authRoutes],
    ['/buses', busRoutes],
    ['/seats', seatRoutes],
    ['/bookings', bookingRoutes],
    ['/routes', routeRoutes],
    ['/admin', adminRoutes],
    ['/trips', tripRoutes],
    ['/payments', paymentRoutes],
    ['/tickets', ticketRoutes],
    ['/offers', offerRoutes],
    ['/destinations', destinationRoutes],
    ['/journal', journalRoutes],
    ['/users/saved-passengers', savedPassengerRoutes],
    ['/packages', packageRoutes],
    ['/images', imageRoutes],
  ];

  apiRouters.forEach(([subPath, router]) => {
    app.use(`/api${subPath}`, router);
    app.use(subPath, router);
  });

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found on YatraBus API`,
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}

const defaultApp = createApp();
export default defaultApp;
