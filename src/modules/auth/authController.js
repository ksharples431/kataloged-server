import HttpError from '../../models/httpErrorModel.js';
import { adminAuth } from '../../config/firebaseConfig.js';
import { tokenCache } from '../../middleware/tokenMiddleware.js';
import { validateInput } from './helpers/validationHelpers.js';
import { googleSignInSchema, signupSchema } from './authModel.js';
import {
  fetchUserById,
  handleUserCreationOrFetch,
} from './helpers/utilityHelpers.js';

//todo: fix returned data, use a helper function
export const googleSignIn = async (req, res, next) => {
  try {
    validateInput(req.body, googleSignInSchema);

    const { email } = req.body;
    const { uid, username } = req.user;

    if (!uid) {
      throw new HttpError(
        'No user id provided, authentication failed',
        401
      );
    }

    const userData = {
      username: username || email.split('@')[0],
      email,
    };

    const user = await handleUserCreationOrFetch(uid, userData);

    const isNewUser = user.createdAt === user.updatedAt;

    res.status(200).json({
      message: isNewUser
        ? 'User created successfully'
        : 'User signed in successfully',
      user,
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
      throw new HttpError(
        'No user id provided, authentication failed',
        401
      );
    }

    const user = await handleUserCreationOrFetch(uid, { username, email });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    if (error instanceof HttpError && error.statusCode !== 404) {
      return next(new HttpError('User with this UID already exists', 409));
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      throw new HttpError(
        'No user id provided, authentication failed',
        401
      );
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
      throw new HttpError('Invalid authorization header format', 401);
    }

    tokenCache.del(idToken);

    const { uid } = req.user;

    if (!uid) {
      throw new HttpError(
        'No user id provided, authentication failed',
        401
      );
    }

    await adminAuth.revokeRefreshTokens(uid);

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    next(error);
  }
};
