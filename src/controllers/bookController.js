import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';
import { formatBookData } from '../utils/controllerUtils.js';

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

    const formattedNewBook = formatBookData(doc);

    res.status(201).json({
      message: 'Book added successfully',
      book: formattedNewBook,
    });
  } catch (error) {
    next(error);
  }
};

export const getBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    if (!bookId) {
      throw new HttpError('Book ID is required', 400);
    }

    const bookDoc = await bookCollection.doc(bookId).get();
    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404);
    }

    const formattedBook = formatBookData(bookDoc);

    res.status(200).json(formattedBook);
  } catch (error) {
    next(error);
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    const booksSnapshot = await bookCollection.get();
    const formattedBooks = booksSnapshot.docs.map(formatBookData);

    res.status(200).json(formattedBooks);
  } catch (error) {
    next(error);
  }
};

export const editBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    console.log(bookId);
    if (!bookId) {
      throw new HttpError('Book ID is required', 400);
    }

    const updateData = { ...req.body };
    delete updateData.createdAt; 

    if (Object.keys(updateData).length === 0) {
      throw new HttpError('No valid fields provided for update', 400);
    }

    updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

    await bookCollection.doc(bookId).update(updateData);

    const updatedBookDoc = await bookCollection.doc(bookId).get();
    if (!updatedBookDoc.exists) {
      throw new HttpError('Book not found after update', 404);
    }

    const formattedUpdatedBook = formatBookData(updatedBookDoc);

    res.status(200).json({
      message: 'Book updated successfully',
      book: formattedUpdatedBook,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    if (!bookId) {
      throw new HttpError('Book ID is required', 400);
    }

    const bookDoc = await bookCollection.doc(bookId).get();
    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404);
    }

    await bookCollection.doc(bookId).delete();
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};