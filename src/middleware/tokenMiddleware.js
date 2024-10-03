import NodeCache from 'node-cache';
import { adminAuth } from '../config/firebaseConfig.js';
import { createCustomError } from '../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
  mapFirebaseAuthErrorToCustomError,
} from '../errors/errorMappings.js';

// Set TTL to 1 hour (3600 seconds) and check for expired entries every 10 minutes
export const tokenCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
});

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createCustomError(
        'No authorization header provided',
        HttpStatusCodes.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS,
        { requestId: req.id },
        { category: ErrorCategories.CLIENT_ERROR.AUTHENTICATION }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      throw createCustomError(
        'Invalid authorization header format',
        HttpStatusCodes.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS,
        { requestId: req.id },
        { category: ErrorCategories.CLIENT_ERROR.AUTHENTICATION }
      );
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
    next(mapFirebaseAuthErrorToCustomError(error, req));
  }
};

export default verifyToken;
