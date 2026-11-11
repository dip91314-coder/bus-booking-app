import { ForbiddenError } from '../utils/customErrors.js';

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Administrative authorization required to access this endpoint.'));
  }
  next();
}
