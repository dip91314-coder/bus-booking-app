import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError } from '../utils/customErrors.js';
import { User } from '../models/User.js';

export async function authenticate(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new UnauthorizedError('Authentication token is missing. Please log in.'));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired authentication session. Please log in again.'));
  }

  let user;
  try {
    user = await User.findById(decoded.userId).select('role status');
  } catch (error) {
    return next(error);
  }
  if (!user || user.status === 'Suspended') {
    return next(new UnauthorizedError('This account is unavailable.'));
  }

  req.user = { userId: user._id.toString(), role: user.role };
  return next();
}
