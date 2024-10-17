import firebase from 'firebase-admin';
import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';

const userCollection = db.collection('users');

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.statusCode = HttpStatusCodes.BAD_REQUEST;
    validationError.details = error.details;
    throw validationError;
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
      const error = new Error('User not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      throw error;
    }
    return {
      uid: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    const dbError = new Error('Failed to fetch user data');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.originalError = error;
    throw dbError;
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
    const dbError = new Error('Failed to create user');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.originalError = error;
    throw dbError;
  }
};
