import db from '../config/firebaseConfig.js';
import HttpError from '../models/httpErrorModel.js';
import firebase from 'firebase-admin';

const bookCollection = db.collection('books');

export const addBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      imagePath,
      genre,
      description,
      seriesName,
      seriesNumber,
      format,
      owned,
      progress,
      favorite,
      whereToGet,
      wishlist,
    } = req.body;

    if (!title || !author) {
      throw new HttpError('Title and author are required', 400);
    }

    const newBook = {
      title,
      author,
      imagePath,
      genre,
      description,
      seriesName,
      seriesNumber,
      format,
      owned,
      progress,
      favorite,
      whereToGet,
      wishlist,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Remove undefined fields???

    const docRef = await bookCollection.add(newBook);

    res
      .status(201)
      .json({ message: 'Book added successfully', bookId: docRef.id });
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

    res.status(200).json(bookDoc.data());
  } catch (error) {
    next(error);
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    const booksSnapshot = await bookCollection.get();
    const books = booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

export const editBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
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

    res.status(200).json({ message: 'Book updated successfully' });
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
