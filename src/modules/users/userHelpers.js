import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';

const userCollection = db.collection('users');

export const fetchUserById = async (uid, requestId) => {
  try {
    const userDoc = await userCollection.doc(uid).get();
    if (!userDoc.exists) {
      const error = new Error('User not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { uid, requestId };
      throw error;
    }
    return {
      uid: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    const dbError = new Error(
      `Error fetching user by ID: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { uid, requestId };
    throw dbError;
  }
};
