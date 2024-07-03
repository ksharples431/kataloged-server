import db, { admin } from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import { getDocumentById } from '../utils/getDocById.js';
import {
  formatResponseData,
  formatSuccessResponse,
} from '../utils/formatResponseData.js';

const userCollection = db.collection('users');

export const googleSignIn = async (req, res, next) => {
  try {
    const { email } = req.body;
    const idToken = req.headers.authorization.split('Bearer ')[1];

    if (!email || !idToken) {
      throw new HttpError('Email and token are required', 400);
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    let user = await userCollection.doc(uid).get();
    let isNewUser = false;

    if (!user.exists) {
      // New user, create an account
      isNewUser = true;
      const newUser = {
        username: decodedToken.name || email.split('@')[0], // Use name from Google or generate from email
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await userCollection.doc(uid).set(newUser);
      user = await userCollection.doc(uid).get();

      if (!user.exists) {
        throw new HttpError('Failed to create user', 500);
      }
    } else {
      // Existing user, update last login time
      await userCollection.doc(uid).update({
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const formattedUser = formatResponseData(user);

    res
      .status(200)
      .json(
        formatSuccessResponse(
          isNewUser
            ? 'User created successfully'
            : 'User signed in successfully',
          { user: formattedUser }
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const idToken = req.headers.authorization.split('Bearer ')[1];

    if (!username || !email || !idToken) {
      throw new HttpError('Username, email, and token are required', 400);
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const existingUser = await userCollection.doc(uid).get();
    if (existingUser.exists) {
      throw new HttpError('User with this UID already exists', 409);
    }

    const newUser = {
      username,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userCollection.doc(uid).set(newUser);

    const createdUser = await userCollection.doc(uid).get();

    if (!createdUser.exists) {
      throw new HttpError('Failed to create user', 500);
    }

    const user = formatResponseData(createdUser);

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
