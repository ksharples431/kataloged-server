import NodeCache from 'node-cache';
import { adminAuth } from '../config/firebaseConfig.js';
import HttpError from '../errors/httpErrorModel.js';

// Set TTL to 1 hour (3600 seconds) and check for expired entries every 10 minutes
export const tokenCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
});

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new HttpError('No authorization header provided', 401);
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      throw new HttpError('Invalid authorization header format', 401);
    }

    const cachedUser = tokenCache.get(idToken);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    tokenCache.set(idToken, decodedToken);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    error.name = 'FirebaseAuthError';
    next(error);
  }
};

export default verifyToken;
