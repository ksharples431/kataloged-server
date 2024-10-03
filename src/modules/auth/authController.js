import { validateInput } from './authHelpers.js';
import { googleSignInSchema } from './authModel.js';
import { adminAuth } from '../../config/firebaseConfig.js';
import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorMappings.js';
import db from '../../config/firebaseConfig.js';
import { tokenCache } from '../../middleware/tokenMiddleware.js';

const userCollection = db.collection('users');

export const googleSignIn = async (req, res, next) => {
  try {
    // Validate input
    validateInput(req.body, googleSignInSchema);

    const { idToken } = req.body;

    if (!idToken) {
      throw createCustomError(
        'ID token is missing',
        HttpStatusCodes.BAD_REQUEST,
        ErrorCodes.INVALID_INPUT,
        { requestId: req.id },
        { category: ErrorCategories.CLIENT_ERROR.VALIDATION }
      );
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
        throw createCustomError(
          'Failed to create user',
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          ErrorCodes.DATABASE_ERROR,
          { uid, email: verifiedEmail },
          { category: ErrorCategories.SERVER_ERROR.DATABASE }
        );
      }
    }

    // Prepare user data
    const userData = {
      uid: user.id,
      ...user.data(),
    };

    // Respond with appropriate message
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

export const signup = async (req, res) => {
  validateInput(req.body, signupSchema);

  const { username, email } = req.body;
  const { uid } = req.user;

  if (!uid) {
    throw createCustomError(
      'No user id provided, authentication failed',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS,
      { requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.AUTHENTICATION }
    );
  }

  let user;
  try {
    user = await handleUserCreationOrFetch(uid, { username, email });
  } catch (error) {
    if (error.statusCode === HttpStatusCodes.NOT_FOUND) {
      throw createCustomError(
        'User with this UID already exists',
        HttpStatusCodes.CONFLICT,
        ErrorCodes.RESOURCE_ALREADY_EXISTS,
        { userId: uid, requestId: req.id },
        { category: ErrorCategories.CLIENT_ERROR.CONFLICT }
      );
    }
    throw error;
  }

  res.status(201).json({
    message: 'User created successfully',
    user,
  });
};

export const login = async (req, res) => {
  const { uid } = req.user;

  if (!uid) {
    throw createCustomError(
      'No user id provided, authentication failed',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS,
      { requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.AUTHENTICATION }
    );
  }

  const user = await fetchUserById(uid);

  res.status(200).json({
    message: 'User logged in successfully',
    user,
  });
};

export const logout = async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    throw createCustomError(
      'Invalid authorization header format',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS,
      { requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.AUTHENTICATION }
    );
  }

  tokenCache.del(idToken);

  const { uid } = req.user;

  if (!uid) {
    throw createCustomError(
      'No user id provided, authentication failed',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS,
      { requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.AUTHENTICATION }
    );
  }

  try {
    await adminAuth.revokeRefreshTokens(uid);
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    throw createCustomError(
      'Failed to revoke refresh tokens',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.UNEXPECTED_ERROR,
      { requestId: req.id, uid },
      {
        category: ErrorCategories.SERVER_ERROR.INTERNAL,
        originalError: error,
      }
    );
  }
};