import db from '../config/firebaseConfig.js';
import firebase from 'firebase-admin';
import { sortBooks } from './utils/bookSorting.js';
import {
  ValidationError,
  DatabaseError,
} from '../models/httpErrorModel.js';
import {
  formatResponseData,
  formatSuccessResponse,
  getDocumentById,
  validateSortOptions,
} from './utils/helperFunctions.js';
import {
  mapAuthorsFromBooks,
  mapGenresFromBooks,
  mapAuthorBooks,
  mapGenreBooks,
} from './utils/bookMapping.js';
import { createBookSchema, validateInput } from '../models/bookModel.js';

const bookCollection = db.collection('books');

// Create Book
export const createBook = async (req, res, next) => {
  try {
    validateInput(req.body, createBookSchema);
    
    const { title, author, ...otherFields } = req.body;

    if (!title || !author) {
      throw new ValidationError('Title and author required');
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
      throw new DatabaseError('create book');
    }

    const book = formatResponseData(doc);

    res
      .status(201)
      .json(formatSuccessResponse('Book added successfully', { book }));
  } catch (error) {
    next(error);
  }
};

// Get Book by ID
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

// Update Book
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

// Delete Book
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

// Get Books with sorting
export const getBooks = async (req, res, next) => {
  try {
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    const querySnapshot = await bookCollection.get();
    let books = querySnapshot.docs.map(formatResponseData);
    books = sortBooks(books, sortBy, order);

    res
      .status(200)
      .json(
        formatSuccessResponse('Books fetched successfully', { books })
      );
  } catch (error) {
    next(error);
  }
};

// Get Authors with book count and sorting
export const getAuthors = async (req, res, next) => {
  try {
    const { sortBy = 'author', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let authors = await mapAuthorsFromBooks();
    authors = sortBooks(authors, sortBy, order);

    res
      .status(200)
      .json(
        formatSuccessResponse('Authors fetched successfully', { authors })
      );
  } catch (error) {
    next(error);
  }
};

// Get Genres with book count and sorting
export const getGenres = async (req, res, next) => {
  try {
    const { sortBy = 'genre', order = 'asc' } = req.query;

    validateSortOptions(sortBy, order);

    let genres = await mapGenresFromBooks();
    genres = sortBooks(genres, sortBy, order);

    res
      .status(200)
      .json(
        formatSuccessResponse('Authors fetched successfully', { genres })
      );
  } catch (error) {
    next(error);
  }
};

// Get Books by Author with sorting
export const getBooksByAuthor = async (req, res, next) => {
  try {
    const { author } = req.params;
    const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapAuthorBooks(author);
    books = sortBooks(books, sortBy, order);

    res.status(200).json(
      formatSuccessResponse('Books by author fetched successfully', {
        books,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get Books by Genre with sorting
export const getBooksByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
     const { sortBy = 'title', order = 'asc' } = req.query;
    validateSortOptions(sortBy, order);

    let books = await mapGenreBooks(genre);
    books = sortBooks(books, sortBy, order);

    res.status(200).json(
      formatSuccessResponse('Books by genre fetched successfully', {
        books,
      })
    );
  } catch (error) {
    next(error);
  }
};
