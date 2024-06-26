import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';
import { getDocumentById } from '../utils/getDocById.js';
import {
  formatResponseData,
  formatSuccessResponse,
} from '../utils/formatResponseData.js';
import {
  fetchCombinedBookData,
  fetchCombinedBooksData,
} from '../utils/combineBookData.js';

const userBookCollection = db.collection('userBooks');

export const addUserBook = async (req, res, next) => {
  try {
    const { uid, bid, ...otherFields } = req.body;
    if (!uid || !bid) {
      throw new HttpError('User ID and Book ID are required', 400);
    }
    const newUserBook = {
      uid,
      bid,
      ...otherFields,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await userBookCollection.add(newUserBook);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new HttpError('Failed to add book to user library', 500);
    }
    const userBook = formatResponseData(doc);
    res
      .status(201)
      .json(
        formatSuccessResponse('Book added to user library successfully', {
          userBook,
        })
      );
  } catch (error) {
    next(error);
  }
};

export const getUserBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userBookDoc = await getDocumentById(
      userBookCollection,
      id,
      'User Book'
    );

    const combinedData = await fetchCombinedBookData(userBookDoc);

    if (!combinedData) {
      throw new HttpError(`Associated Book not found`, 404);
    }

    res
      .status(200)
      .json(
        formatSuccessResponse('User Book retrieved successfully', {
          userBook: combinedData,
        })
      );
  } catch (error) {
    next(error);
  }
};

export const getUserBooks = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const snapshot = await userBookCollection
      .where('uid', '==', uid)
      .get();

    if (snapshot.empty) {
      return res
        .status(200)
        .json(
          formatSuccessResponse('No books found for this user', {
            userBooks: [],
          })
        );
    }

    const userBooksWithFullInfo = await fetchCombinedBooksData(
      snapshot.docs
    );

    res
      .status(200)
      .json(
        formatSuccessResponse('User Books retrieved successfully', {
          userBooks: userBooksWithFullInfo,
        })
      );
  } catch (error) {
    next(error);
  }
};

export const updateUserBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await getDocumentById(userBookCollection, id, 'User Book');

    const currentData = doc.data();
    const updateData = { ...req.body };

    delete updateData.id;
    delete updateData.createdAt;

    const hasChanges = Object.entries(updateData).some(
      ([key, value]) => currentData[key] !== value
    );

    if (!hasChanges) {
      const userBook = formatResponseData(doc);
      return res
        .status(200)
        .json(formatSuccessResponse('No changes detected', { userBook }));
    }

    updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await doc.ref.update(updateData);

    const updatedDoc = await doc.ref.get();
    const userBook = formatResponseData(updatedDoc);

    res
      .status(200)
      .json(
        formatSuccessResponse('User book updated successfully', {
          userBook,
        })
      );
  } catch (error) {
    next(error);
  }
};

export const deleteUserBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await getDocumentById(userBookCollection, id, 'User Book');

    await doc.ref.delete();
    res
      .status(200)
      .json(
        formatSuccessResponse(
          'Book removed from user library successfully',
          null
        )
      );
  } catch (error) {
    next(error);
  }
};
