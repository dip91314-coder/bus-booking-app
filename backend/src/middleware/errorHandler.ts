import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/customErrors.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters or payload',
        details: formattedErrors,
      },
    });
    return;
  }

  // 2. Custom Application Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.name,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // 3. MongoDB Duplicate Key (E11000)
  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE_CONFLICT',
        message: 'A resource with these unique attributes or seats already exists.',
        details: (err as { keyValue?: unknown }).keyValue,
      },
    });
    return;
  }

  // 4. Fallback Internal Server Error
  logger.error({ err, requestId: req.id }, 'Unhandled Exception');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}
