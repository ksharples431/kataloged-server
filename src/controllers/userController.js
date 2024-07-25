import HttpError from '../models/httpErrorModel.js';
import db from '../config/firebaseConfig.js';
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
    next(
      new HttpError('Fetching users failed, please try again later.', 500)
    );
  }
};

export const getUserById = async (req, res, next) => {
  const { uid } = req.params;
  try {
    const userDoc = await userCollection.doc(uid).get();
    if (!userDoc.exists) {
      return next(new HttpError('User not found.', 404));
    }
    const userData = userDoc.data();
    res.status(200).json({
      message: 'User fetched successfully',
      user: { uid: userDoc.id, ...userData },
    });
  } catch (error) {
    next(
      new HttpError('Fetching user failed, please try again later.', 500)
    );
  }
};

export const updateUser = async (req, res, next) => {
  const { uid } = req.params;
  const updateData = req.body;

  try {
    const userRef = userCollection.doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return next(new HttpError('User not found.', 404));
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
    next(
      new HttpError('Updating user failed, please try again later.', 500)
    );
  }
};

export const deleteUser = async (req, res, next) => {
  const { uid } = req.params;

  try {
    const userRef = userCollection.doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return next(new HttpError('User not found.', 404));
    }

    await userRef.delete();

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(
      new HttpError('Deleting user failed, please try again later.', 500)
    );
  }
};
