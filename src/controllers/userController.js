import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';

const userCollection = db.collection('users');

export const addUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new HttpError('Name and email are required', 400);
    }

    const userDoc = await userCollection.where('email', '==', email).get();
    if (!userDoc.empty) {
      throw new HttpError('User already exists', 409);
    }

    const newUser = {
      name,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const userRef = await userCollection.add(newUser);

    res
      .status(201)
      .json({ message: 'User added successfully', userId: userRef.id });
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
