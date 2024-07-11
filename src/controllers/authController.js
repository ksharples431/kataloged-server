import db, { adminAuth } from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import { tokenCache } from '../middleware/authMiddleware.js';
import { validateInput } from './utils/helperFunctions.js';
import {
  googleSignInSchema,
  signupSchema,
} from '../models/authModel.js';

const userCollection = db.collection('users');

export const googleSignIn = async (req, res, next) => {
  try {
    validateInput(req.body, googleSignInSchema);

    const { email } = req.body;
    const { uid, username } = req.user;

    let user = await userCollection.doc(uid).get();
    let isNewUser = false;

    if (!user.exists) {
      isNewUser = true;
      const now = new Date().toISOString();
      const newUser = {
        username: username || email.split('@')[0],
        email,
        createdAt: now,
        updatedAt: now,
      };

      await userCollection.doc(uid).set(newUser);
      user = await userCollection.doc(uid).get();

      if (!user.exists) {
        throw new HttpError('Failed to create user', 500);
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

    const existingUser = await userCollection.doc(uid).get();
    if (existingUser.exists) {
      throw new HttpError('User with this UID already exists', 409);
    }

    const now = new Date().toISOString();
    const newUser = {
      username,
      email,
      createdAt: now,
      updatedAt: now,
    };

    await userCollection.doc(uid).set(newUser);

    const createdUser = await userCollection.doc(uid).get();

    if (!createdUser.exists) {
      throw new HttpError('Failed to create user', 500);
    }

    const userData = {
      uid: createdUser.id,
      ...createdUser.data(),
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { uid } = req.user
    const userDoc = await userCollection.doc(uid).get();

    if (!userDoc.exists) {
      throw new HttpError('User not found', 404);
    }

    const userData = {
      uid: userDoc.id,
      ...userDoc.data(),
    };

    res.status(200).json({
      message: 'User logged in successfully',
      user: userData,
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
    const uid = req.user.uid;
    await adminAuth.revokeRefreshTokens(uid);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
