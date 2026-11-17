import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const resolvedMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || '';

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default(resolvedMongoUri),
  MONGODB_URI: z.string().default(resolvedMongoUri),
  JWT_SECRET: z.string().min(16).default(process.env.JWT_SECRET || 'yatrabus_jwt_access_fallback_secret_key_32bytes'),
  JWT_REFRESH_SECRET: z.string().min(16).default(process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_fallback_key_32bytes'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  LOCK_MINUTES: z.string().default('8').transform((val) => parseInt(val, 10)),
  RAZORPAY_KEY_ID: z.string().optional().default('rzp_test_mock_key_id'),
  RAZORPAY_KEY_SECRET: z.string().optional().default('rzp_test_mock_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default('rzp_webhook_secret_key_12345'),
  SMTP_HOST: z.string().default(process.env.SMTP_HOST || ''),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.string().default('false').transform((value) => value.toLowerCase() === 'true'),
  SMTP_USER: z.string().default(process.env.SMTP_USER || ''),
  SMTP_PASS: z.string().default(process.env.SMTP_PASS || ''),
  EMAIL_FROM: z.string().default(process.env.EMAIL_FROM || ''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  if (!isServerless && process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

if (!resolvedMongoUri) {
  console.warn('⚠️  Warning: MONGO_URI / MONGODB_URI is not set. Please set MONGO_URI or MONGODB_URI in your environment or Vercel settings.');
}

export const env = parsed.success ? parsed.data : {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'production',
  MONGO_URI: resolvedMongoUri,
  MONGODB_URI: resolvedMongoUri,
  JWT_SECRET: process.env.JWT_SECRET || 'yatrabus_jwt_access_fallback_secret_key_32bytes',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_fallback_key_32bytes',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  REDIS_URL: process.env.REDIS_URL,
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  LOCK_MINUTES: parseInt(process.env.LOCK_MINUTES || '8', 10),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_id',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_key_12345',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
};
