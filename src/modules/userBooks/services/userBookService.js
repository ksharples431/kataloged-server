import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../models/httpErrorModel.js';
import firebase from 'firebase-admin';
import { sortBooks } from '../helpers/sortingHelpers.js';
import { validateSortOptions } from '../helpers/validationHelpers.js';
import { generateLowercaseFields } from '../helpers/utilityHelpers.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid) => {
  try {
    const bookDoc = await bookCollection.doc(bid).get();
    if (!bookDoc.exists) {
      throw new HttpError('Book not found', 404);
    }
    return bookDoc.data();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error fetching book:', error);
    throw new HttpError('Failed to fetch book', 500);
  }
};

export const fetchUserBookById = async (ubid) => {
  try {
    const userBookDoc = await userBookCollection.doc(ubid).get();
    if (!userBookDoc.exists) {
      throw new HttpError('User book not found', 404);
    }
    return userBookDoc.data();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error fetching user book:', error);
    throw new HttpError('Failed to fetch user book', 500);
  }
};

export const fetchUserBooks = async (
  uid,
  sortBy = 'title',
  order = 'asc'
) => {
  try {
    validateSortOptions(sortBy, order);

    const snapshot = await userBookCollection
      .where('uid', '==', uid)
      .get();
    let userBooks = snapshot.docs.map((doc) => doc.data());

    // combine user books with book data

    return sortBooks(userBooks, sortBy, order);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error fetching user books:', error);
    throw new HttpError('Failed to fetch user books', 500);
  }
};

export const createUserBookHelper = async ({
  uid,
  bid,
  kataloged
}) => {
  try {
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
      kataloged,
      updatedAtString: new Date().toISOString(),
    };

    const docRef = await userBookCollection.add(newUserBook);
    const ubid = docRef.id;
    await docRef.update({ ubid });
    return fetchUserBookById(ubid);
  } catch (error) {
    console.error('Error creating user book:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError('Failed to create user book', 500);
  }
};

export const updateUserBookHelper = async (ubid, updateData) => {
  try {
    const userBookRef = userBookCollection.doc(ubid);
    const userBookDoc = await userBookRef.get();

    if (!userBookDoc.exists) {
      throw new HttpError('User book not found', 404);
    }

    const mergedData = {
      ...userBookDoc.data(),
      ...updateData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtString: new Date().toISOString(),
    };

    const updatedUserBook = generateLowercaseFields(mergedData);

    Object.keys(updatedUserBook).forEach((key) =>
      updatedUserBook[key] === undefined ? delete updatedUserBook[key] : {}
    );

    await userBookRef.update(updatedUserBook);
    return fetchUserBookById(ubid);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error updating user book:', error);
    throw new HttpError('Failed to update user book', 500);
  }
};

export const deleteUserBookHelper = async (ubid) => {
  try {
    const userBookRef = userBookCollection.doc(ubid);
    const userBookDoc = await userBookRef.get();

    if (!userBookDoc.exists) {
      throw new HttpError('User book not found', 404);
    }

    await userBookRef.delete();
  } catch (error) {
    console.error('Error deleting user book:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError('Failed to delete user book', 500);
  }
};
