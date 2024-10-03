import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorMappings.js';
import db from '../../config/firebaseConfig.js';
import firebase from 'firebase-admin';

const userCollection = db.collection('users');

export const getAllUsers = async (req, res) => {
  const snapshot = await userCollection.get();
  const users = snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));

  res.status(200).json({
    message: 'Users fetched successfully',
    users,
  });
};

export const getUserById = async (req, res) => {
  const { uid } = req.params;
  const userDoc = await userCollection.doc(uid).get();

  if (!userDoc.exists) {
    throw createCustomError(
      'User not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { userId: uid, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  const userData = userDoc.data();
  res.status(200).json({
    message: 'User fetched successfully',
    user: { uid: userDoc.id, ...userData },
  });
};


export const updateUser = async (req, res) => {
  const { uid } = req.params;
  const updateData = req.body;

  const userRef = userCollection.doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw createCustomError(
      'User not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { userId: uid, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  await userRef.update({
    ...updateData,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  });

  const updatedUserDoc = await userRef.get();
  const updatedUserData = updatedUserDoc.data();

  res.status(200).json({
    message: 'User updated successfully',
    user: { uid: updatedUserDoc.id, ...updatedUserData },
  });
};

export const deleteUser = async (req, res) => {
  const { uid } = req.params;

  const userRef = userCollection.doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw createCustomError(
      'User not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { userId: uid, requestId: req.id },
      { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
    );
  }

  await userRef.delete();

  res.status(200).json({
    message: 'User deleted successfully',
  });
};
