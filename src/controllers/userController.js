import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';

const userCollection = db.collection('users');

export const addUser = async (req, res, next) => {
  try {
    const { uid, username, email } = req.body;

    if (!uid ||!username || !email) {
      throw new HttpError('UID, name and email are required', 400);
    }

    const userDoc = await userCollection.doc(uid).get();

    if (userDoc.exists) {
      throw new HttpError('User already exists', 409);
    }

    const newUser = {
      username,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await userCollection.doc(uid).set(newUser);

    res
      .status(201)
      .json({ message: 'User added successfully', userId: uid });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new HttpError('User ID is required', 400);
    }

    const userDoc = await userCollection.doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpError('User not found', 404);
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    next(error);
  }
};

export const editUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new HttpError('User ID is required', 400);
    }

    const { name, email } = req.body;
    if (!name && !email) {
      throw new HttpError(
        'At least one field (name or email) is required for update',
        400
      );
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await userCollection.doc(userId).update(updateData);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new HttpError('User ID is required', 400);
    }

    const userDoc = await userCollection.doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpError('User not found', 404);
    }

    await userCollection.doc(userId).delete();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
