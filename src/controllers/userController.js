import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';
import { getDocumentById } from '../utils/getDocById.js';
import {
  formatResponseData,
  formatSuccessResponse,
} from '../utils/formatResponseData.js';

const userCollection = db.collection('users');

export const createUser = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      throw new HttpError('Username and email are required', 400);
    }

    const existingUser = await userCollection
      .where('email', '==', email)
      .get();
    if (!existingUser.empty) {
      throw new HttpError('User with this email already exists', 409);
    }

    const newUser = {
      username,
      email,
      token: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await userCollection.add(newUser);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new HttpError('Failed to create user', 500);
    }

    const user = formatResponseData(doc);

    res
      .status(201)
      .json(formatSuccessResponse('User created successfully', { user }));
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const doc = await getDocumentById(userCollection, uid, 'User');

    const user = formatResponseData(doc);
    res
      .status(200)
      .json(formatSuccessResponse('User successfully fetched', { user }));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const doc = await getDocumentById(userCollection, uid, 'User');

    const currentData = doc.data();
    const updateData = { ...req.body };

    delete updateData.id;
    delete updateData.createdAt;

    const hasChanges = Object.entries(updateData).some(
      ([key, value]) => currentData[key] !== value
    );

    if (!hasChanges) {
      const user = formatResponseData(doc);
      return res
        .status(200)
        .json(formatSuccessResponse('No changes detected', { user }));
    }

    updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await doc.ref.update(updateData);

    const updatedDoc = await doc.ref.get();

    const user = formatResponseData(updatedDoc);
    res
      .status(200)
      .json(formatSuccessResponse('User updated successfully', { user }));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const doc = await getDocumentById(userCollection, uid, 'User');

    await doc.ref.delete();
    res
      .status(200)
      .json(formatSuccessResponse('User deleted successfully', null));
  } catch (error) {
    next(error);
  }
};
