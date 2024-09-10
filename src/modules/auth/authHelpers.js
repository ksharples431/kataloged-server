import firebase from 'firebase-admin';
import db from '../../config/firebaseConfig.js';
import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';

const userCollection = db.collection('users');

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw createCustomError(
      error.details[0].message,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { details: error.details },
      { category: ErrorCategories.CLIENT_ERROR.VALIDATION }
    );
  }
};

export const handleUserCreationOrFetch = async (uid, userData) => {
  try {
    return await fetchUserById(uid);
  } catch (error) {
    if (error.statusCode === HttpStatusCodes.NOT_FOUND) {
      return await createUser(uid, userData);
    }
    throw error;
  }
};

export const fetchUserById = async (uid) => {
  try {
    const userDoc = await userCollection.doc(uid).get();
    if (!userDoc.exists) {
      throw createCustomError(
        'User not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }
    return {
      uid: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    if (error.name === 'CustomError') {
      throw error;
    }
    throw createCustomError(
      'Failed to fetch user data',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid },
      {
        category: ErrorCategories.SERVER_ERROR.DATABASE,
        originalError: error,
      }
    );
  }
};

export const createUser = async (uid, { username, email }) => {
  const newUser = {
    username,
    email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };

  try {
    await userCollection.doc(uid).set(newUser);
    return fetchUserById(uid);
  } catch (error) {
    throw createCustomError(
      'Failed to create user',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, username, email },
      {
        category: ErrorCategories.SERVER_ERROR.DATABASE,
        originalError: error,
      }
    );
  }
};
