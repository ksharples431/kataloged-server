import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
import { adminAuth } from '../../config/firebaseConfig.js';
import { tokenCache } from '../../middleware/tokenMiddleware.js';
import { googleSignInSchema, signupSchema } from './authModel.js';
import {
  validateInput,
  fetchUserById,
  handleUserCreationOrFetch,
} from './authHelpers.js';

export const googleSignIn = async (req, res) => {
  validateInput(req.body, googleSignInSchema);

  const { email } = req.body;
  const { uid, username } = req.user;

  if (!uid) {
    throw createCustomError(
      'No user id provided, authentication failed',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS,
      { requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.AUTHENTICATION }
    );
  }

  const userData = {
    username: username || email.split('@')[0],
    email,
  };

  const user = await handleUserCreationOrFetch(uid, userData);

  res.status(200).json({
    message: 'User signed in successfully',
    user,
  });
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

  await adminAuth.revokeRefreshTokens(uid);

  res.status(200).json({ message: 'User logged out successfully' });
};
