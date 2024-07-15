import HttpError from '../../models/httpErrorModel.js';
const bookCollection = db.collection('books');
import db from '../../config/firebaseConfig.js';
import { sortBooks } from './bookSorting.js';

export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new HttpError(error.details[0].message, 400);
  }
};

export const validateSortOptions = (sortBy, order) => {
  const validSortFields = [
    'title',
    'author',
    'genre',
    'updatedAt',
    'bookCount',
  ];
  const validOrders = ['asc', 'desc'];

  if (!validSortFields.includes(sortBy)) {
    throw new HttpError('Invalid sort field', 400);
  }

  if (!validOrders.includes(order.toLowerCase())) {
    throw new HttpError('Invalid sort order', 400);
  }
};

export const fetchBookById = async (bid) => {
  const bookDoc = await bookCollection.doc(bid).get();
  if (!bookDoc.exists) {
    throw new HttpError('Book not found', 404);
  }
  return {
    bid: bookDoc.id,
    ...bookDoc.data(),
  };
};

export const fetchAllBooks = async (sortBy = 'title', order = 'asc') => {
  validateSortOptions(sortBy, order);

  const snapshot = await bookCollection.get();
  let books = snapshot.docs.map((doc) => ({
    ...doc.data(),
    bid: doc.id,
  }));

  return sortBooks(books, sortBy, order);
};

export const createBookHelper = async ({
  title,
  author,
  ...otherFields
}) => {
  const newBook = {
    title,
    author,
    ...otherFields,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };

  const docRef = await bookCollection.add(newBook);
  return fetchBookById(docRef.id);
};
