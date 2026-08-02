import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../utils/errors.js';

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication Invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';
    const payload = jwt.verify(token, secret);
    
    // Attach user payload to request object
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication Invalid');
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';
      const payload = jwt.verify(token, secret);
      req.user = { userId: payload.userId };
    } catch (error) {
      // Ignore token verification error for optional authentication
    }
  }
  next();
};

export default authenticateUser;
