let multer = null;
try {
  const mod = await import('multer');
  multer = mod.default || mod;
} catch {
  // multer not installed or unavailable in current environment
}

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In serverless environments (e.g. Vercel), use os.tmpdir() because the app root is read-only
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadsDir = isServerless 
  ? path.join(os.tmpdir(), 'uploads') 
  : path.resolve(__dirname, '../../uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  // Gracefully non-fatal in read-only serverless filesystems
}

const storage = multer
  ? multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
      },
    })
  : null;

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

export const uploadImage = multer
  ? multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  : {
      single: () => (req, res, next) => next(),
      array: () => (req, res, next) => next(),
      fields: () => (req, res, next) => next(),
    };
