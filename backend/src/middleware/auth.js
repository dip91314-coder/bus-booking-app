import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError } from '../utils/customErrors.js';

export async function authenticate(req, res, next) {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token is missing. Please log in.');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication session. Please log in again.'));
  }
}
