import { validateInput } from './authHelpers.js';
import { googleSignInSchema } from './authModel.js';
import { adminAuth } from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
import db from '../../config/firebaseConfig.js';
import { tokenCache } from '../../middleware/tokenMiddleware.js';

const userCollection = db.collection('users');

export const googleSignIn = async (req, res, next) => {
  try {
    // Validate input
    validateInput(req.body, googleSignInSchema);

    const { idToken } = req.body;

    if (!idToken) {
      const error = new Error('ID token is missing');
      error.statusCode = HttpStatusCodes.BAD_REQUEST;
      return next(error);
    }

    // Verify the ID token with Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email: verifiedEmail } = decodedToken;

    // Retrieve or create the user in your database
    let user = await userCollection.doc(uid).get();
    let isNewUser = false;

    if (!user.exists) {
      isNewUser = true;
      const now = new Date().toISOString();
      const newUser = {
        username: verifiedEmail.split('@')[0], // Default username from email
        email: verifiedEmail,
        createdAt: now,
        updatedAt: now,
      };

      await userCollection.doc(uid).set(newUser);
      user = await userCollection.doc(uid).get();

      if (!user.exists) {
        const error = new Error('Failed to create user');
        error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
        return next(error);
      }
    }

    const userData = {
      uid: user.id,
      ...user.data(),
    };

    res.status(200).json({
      message: isNewUser
        ? 'User created successfully'
        : 'User signed in successfully',
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  try {
    validateInput(req.body, signupSchema);
    const { username, email } = req.body;
    const { uid } = req.user;

    if (!uid) {
      const error = new Error(
        'No user id provided, authentication failed'
      );
      error.statusCode = HttpStatusCodes.UNAUTHORIZED;
      return next(error);
    }

    const user = await handleUserCreationOrFetch(uid, { username, email });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      const error = new Error(
        'No user id provided, authentication failed'
      );
      error.statusCode = HttpStatusCodes.UNAUTHORIZED;
      return next(error);
    }

    const user = await fetchUserById(uid);

    res.status(200).json({
      message: 'User logged in successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      const error = new Error('Invalid authorization header format');
      error.statusCode = HttpStatusCodes.UNAUTHORIZED;
      return next(error);
    }

    tokenCache.del(idToken);

    const { uid } = req.user;

    if (!uid) {
      const error = new Error(
        'No user id provided, authentication failed'
      );
      error.statusCode = HttpStatusCodes.UNAUTHORIZED;
      return next(error);
    }

    await adminAuth.revokeRefreshTokens(uid);
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    next(error);
  }
};
