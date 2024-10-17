import { HttpStatusCodes } from '../../errors/errorCategories.js';
import db from '../../config/firebaseConfig.js';
import firebase from 'firebase-admin';

const userCollection = db.collection('users');

export const getAllUsers = async (req, res, next) => {
  try {
    const snapshot = await userCollection.get();
    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      message: 'Users fetched successfully',
      users,
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const userDoc = await userCollection.doc(uid).get();

    if (!userDoc.exists) {
      const error = new Error('User not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { userId: uid, requestId: req.id };
      return next(error);
    }

    const userData = userDoc.data();
    res.status(200).json({
      message: 'User fetched successfully',
      user: { uid: userDoc.id, ...userData },
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;

    const userRef = userCollection.doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const error = new Error('User not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { userId: uid, requestId: req.id };
      return next(error);
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
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;

    const userRef = userCollection.doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const error = new Error('User not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { userId: uid, requestId: req.id };
      return next(error);
    }

    await userRef.delete();

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};
