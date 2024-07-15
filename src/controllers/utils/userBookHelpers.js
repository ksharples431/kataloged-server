import HttpError from '../../models/httpErrorModel.js';
import db from '../../config/firebaseConfig.js';
import { sortBooks } from './bookSorting.js';

const userBookCollection = db.collection('userBooks');

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

export const fetchUserBookById = async (ubid) => {
  const userBookDoc = await userBookCollection.doc(ubid).get();
  if (!userBookDoc.exists) {
    throw new HttpError('User Book not found', 404);
  }
  return {
    ubid: userBookDoc.id,
    ...userBookDoc.data(),
  };
};

export const fetchUserBooks = async (
  uid,
  sortBy = 'title',
  order = 'asc'
) => {
  validateSortOptions(sortBy, order);

  const snapshot = await userBookCollection.where('uid', '==', uid).get();
  
  let userBooks = snapshot.docs.map((doc) => ({
    ...doc.data(),
    ubid: doc.id,
  }));
  return sortBooks(userBooks, sortBy, order);
};

export const createUserBookHelper = async ({
  uid,
  bid,
  ...otherFields
}) => {
  const existingBook = await userBookCollection
    .where('uid', '==', uid)
    .where('bid', '==', bid)
    .get();

  if (!existingBook.empty) {
    throw new HttpError(
      "This book already exists in the user's library",
      409
    );
  }

  const newUserBook = {
    uid,
    bid,
    ...otherFields,
    createdAt: db.FieldValue.serverTimestamp(),
    updatedAt: db.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };

  const docRef = await userBookCollection.add(newUserBook);
  return fetchUserBookById(docRef.id);
};

export const fetchCombinedUserBookData = async (userBookDoc) => {
  const userBookData = {
    ubid: userBookDoc.id,
    ...userBookDoc.data(),
  };
  const bookData = await fetchUserBookById(userBookData.bid);

  return {
    ...userBookData,
    ...bookData,
  };
};

export const fetchCombinedUserBooksData = async (userBookDocs) => {
  return Promise.all(userBookDocs.map(fetchCombinedUserBookData));
};
