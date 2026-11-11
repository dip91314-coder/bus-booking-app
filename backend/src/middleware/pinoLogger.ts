import { pinoHttp } from 'pino-http';
import { logger } from '../config/logger.js';
import { Request } from 'express';

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customProps: (req: Request) => ({
    requestId: req.id,
  }),
});
