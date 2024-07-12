import db, { auth } from '../../config/firebaseConfig.js';
import HttpError from '../../models/httpErrorModel.js';

const userCollection = db.collection('users');

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new HttpError(error.details[0].message, 400);
  }
};

export const fetchUserById = async (uid) => {
  const userDoc = await userCollection.doc(uid).get();
  if (!userDoc.exists) {
    throw new HttpError('User not found', 404);
  }
  return {
    uid: userDoc.id,
    ...userDoc.data(),
  };
};

export const createUser = async (uid, { username, email }) => {
  const now = new Date().toISOString();
  const newUser = {
    username,
    email,
    createdAt: now,
    updatedAt: now,
  };

  await userCollection.doc(uid).set(newUser);

  return fetchUserById(uid);
};

export const handleUserCreationOrFetch = async (uid, userData) => {
  try {
    return await fetchUserById(uid);
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 404) {
      return await createUser(uid, userData);
    }
    throw error;
  }
};
