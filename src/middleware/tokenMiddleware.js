import NodeCache from 'node-cache';
import { adminAuth } from '../config/firebaseConfig.js';
import { HttpStatusCodes } from '../errors/errorCategories.js';

// Set TTL to 1 hour (3600 seconds) and check for expired entries every 10 minutes
export const tokenCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
});

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error('No authorization header provided');
      error.statusCode = HttpStatusCodes.UNAUTHORIZED;
      return next(error); // Pass the error to the global handler
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      const error = new Error('Invalid authorization header format');
      error.statusCode = HttpStatusCodes.UNAUTHORIZED;
      return next(error); // Pass the error to the global handler
    }

    // Check for cached user
    const cachedUser = tokenCache.get(idToken);
    if (cachedUser) {
      req.user = cachedUser;
      return next(); // Token is valid, proceed
    }

    // Verify token with Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    tokenCache.set(idToken, decodedToken);

    req.user = decodedToken;
    next(); // Token is valid, proceed
  } catch (error) {
    // Handle Firebase authentication errors directly
    let authError = new Error('Authentication error');
    authError.statusCode = HttpStatusCodes.UNAUTHORIZED;

    if (error.code === 'auth/id-token-expired') {
      authError.message = 'ID token has expired';
      authError.statusCode = HttpStatusCodes.UNAUTHORIZED;
    } else if (error.code === 'auth/user-not-found') {
      authError.message = 'User not found';
      authError.statusCode = HttpStatusCodes.FORBIDDEN;
    } else {
      authError.message =
        error.message || 'Firebase authentication failed';
    }

    next(authError); // Pass the error to the global handler
  }
};

export default verifyToken;
