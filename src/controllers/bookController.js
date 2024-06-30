import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';
import { getDocumentById } from '../utils/getDocById.js';
import {
  formatResponseData,
  formatSuccessResponse,
} from '../utils/formatResponseData.js';

const bookCollection = db.collection('books');

export const addBook = async (req, res, next) => {
  try {
    const { title, author, ...otherFields } = req.body;

    if (!title || !author) {
      throw new HttpError('Title and author are required', 400);
    }

    const newBook = {
      title,
      author,
      ...otherFields,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await bookCollection.add(newBook);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new HttpError('Failed to add book', 500);
    }

    const book = formatResponseData(doc);

    res
      .status(201)
      .json(formatSuccessResponse('Book added successfully', { book }));
  } catch (error) {
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const snapshot = await bookCollection.get();

    const books = snapshot.docs.map((doc) => formatResponseData(doc));

    res
      .status(200)
      .json(
        formatSuccessResponse('Books successfully fetched', { books })
      );
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const doc = await getDocumentById(bookCollection, bid, 'Book');

    const book = formatResponseData(doc);
    res
      .status(200)
      .json(formatSuccessResponse('Book successfully fetched', { book }));
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { bid } = req.params;

    const doc = await getDocumentById(bookCollection, bid, 'Book');

    const currentData = doc.data();
    const updateData = { ...req.body };

    delete updateData.id;
    delete updateData.createdAt;

    const hasChanges = Object.entries(updateData).some(
      ([key, value]) => currentData[key] !== value
    );

    if (!hasChanges) {
      const book = formatResponseData(doc);
      return res
        .status(200)
        .json(formatSuccessResponse('No changes detected', { book }));
    }

    updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await doc.ref.update(updateData);

    const updatedDoc = await doc.ref.get();

    const book = formatResponseData(updatedDoc);
    res
      .status(200)
      .json(formatSuccessResponse('Book updated successfully', { book }));
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const doc = await getDocumentById(bookCollection, bid, 'Book');

    await doc.ref.delete();
    res
      .status(200)
      .json(formatSuccessResponse('Book deleted successfully', null));
  } catch (error) {
    next(error);
  }
};
