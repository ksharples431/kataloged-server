import db from '../../config/firebaseConfig.js';
import HttpError from '../../models/httpErrorModel.js';

const userCollection = db.collection('users');

export const fetchUserById = async (uid) => {
  const userDoc = await userCollection.doc(uid).get();
  if (!userDoc.exists) {
    throw new HttpError('Book not found', 404);
  }
  return {
    uid: userDoc.id,
    ...userDoc.data(),
  };
};
