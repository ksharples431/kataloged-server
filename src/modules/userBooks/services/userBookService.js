import firebase from 'firebase-admin';
import HttpError from '../../../models/httpErrorModel.js';
import db from '../../../config/firebaseConfig.js';
import { sortBooks } from '../helpers/sortingHelpers.js';
import { validateSortOptions } from '../helpers/validationHelpers.js';

const userBookCollection = db.collection('userBooks');
const bookCollection = db.collection('books');

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

  const combinedUserBooks = await Promise.all(
    userBooks.map(async (userBook) => {
      const bookData = await fetchBookById(userBook.bid);
      return {
        ...userBook,
        ...bookData,
      };
    })
  );

  return sortBooks(combinedUserBooks, sortBy, order);
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
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAtString: new Date().toISOString(),
  };

  const docRef = await userBookCollection.add(newUserBook);
  return fetchUserBookById(docRef.id);
};

export const updateBookHelper = async (ubid, updateData) => {
  const userBookRef = userBookCollection.doc(ubid);
  await userBookRef.update(
    {
      ...updateData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtString: new Date().toISOString(),
    },
    { merge: true }
  );

  return fetchUserBookById(ubid);
};

export const deleteBookHelper = async (ubid) => {
  const userBookRef = userBookCollection.doc(ubid);
  // const userBook = await fetchUserBookById(ubid);
  await userBookRef.delete();
  // return userBook;
};
