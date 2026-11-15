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

  // Body parser and compression
  app.use(express.json({
    limit: '1mb',
    verify: (req, _res, buffer) => {
      if (req.originalUrl.split('?')[0] === '/api/payments/webhook') {
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

  // Root Welcome & API Status
  app.get('/', (req, res) => {
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
  });

  // Health check
  app.get('/api/health', (req, res) => {
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
  });

  // Public settings endpoint
  app.get('/api/settings', async (req, res, next) => {
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
  });

  // User notifications endpoint
  app.get('/api/notifications', authenticate, async (req, res, next) => {
    try {
      const notifs = await TripNotification.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(50);
      res.status(200).json({ success: true, count: notifs.length, data: notifs });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/notifications/:id/read', authenticate, async (req, res, next) => {
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
  });

  // API Route mounting
  app.use('/api/auth', authRoutes);
  app.use('/api/buses', busRoutes);
  app.use('/api/seats', seatRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/offers', offerRoutes);
  app.use('/api/destinations', destinationRoutes);
  app.use('/api/journal', journalRoutes);
  app.use('/api/users/saved-passengers', savedPassengerRoutes);
  app.use('/api/packages', packageRoutes);

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
