import crypto from 'crypto';

export function requestId(req, res, next) {
  const existingId = req.headers['x-request-id'];
  const reqId = existingId || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('x-request-id', reqId);
  next();
}
