import firebase from 'firebase-admin';
import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../models/httpErrorModel.js';

const userCollection = db.collection('users');

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

export const fetchUserById = async (uid) => {
  try {
    const userDoc = await userCollection.doc(uid).get();
    if (!userDoc.exists) {
      throw new HttpError('User not found', 404);
    }
    return {
      uid: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    throw new HttpError('Failed to fetch user data', 500);
  }
};

//todo: make a decision on timestamps
export const createUser = async (uid, { username, email }) => {
  const newUser = {
    username,
    email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };

  await userCollection.doc(uid).set(newUser);

  return fetchUserById(uid);
};

