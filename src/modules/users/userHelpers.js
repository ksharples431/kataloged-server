import db from '../../config/firebaseConfig.js';
import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorMappings.js';

const userCollection = db.collection('users');

export const fetchUserById = async (uid, requestId) => {
  const userDoc = await userCollection.doc(uid).get();
  if (!userDoc.exists) {
    throw createCustomError(
      'User not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { uid, requestId },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }
  return {
    uid: userDoc.id,
    ...userDoc.data(),
  };
};