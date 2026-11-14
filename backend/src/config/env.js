import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long').default('jwt_refresh_secret_fallback_key_32bytes'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().optional(),
  LOCK_MINUTES: z.string().default('8').transform((val) => parseInt(val, 10)),
  RAZORPAY_KEY_ID: z.string().optional().default('rzp_test_mock_key_id'),
  RAZORPAY_KEY_SECRET: z.string().optional().default('rzp_test_mock_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default('rzp_webhook_secret_key_12345'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
