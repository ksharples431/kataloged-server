import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';
import { logEntry } from '../../../config/cloudLoggingConfig.js';
import {
  sortUserBooks,
  validateSortOptions,
  generateLowercaseFields,
  executeQuery,
} from '../userBookHelpers.js';
import { combineBooksData } from './combineBooksService.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid) => {
  try {
    const bookDoc = await bookCollection.doc(bid).get();
    if (!bookDoc.exists) {
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
    }

    await logEntry({
      message: `Book fetched by ID`,
      severity: 'INFO',
      bid,
    });

    return bookDoc.data();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error fetching book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid, error: error.message }
    );
  }
};

export const fetchUserBookById = async (ubid) => {
  try {
    const userBookDoc = await userBookCollection.doc(ubid).get();
    if (!userBookDoc.exists) {
      throw new HttpError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid }
      );
    }
    const userBook = userBookDoc.data();
    const combinedBook = await combineBooksData(userBook);

    await logEntry({
      message: `User book fetched by ID`,
      severity: 'INFO',
      ubid,
    });

    return combinedBook;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error fetching user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { ubid, error: error.message }
    );
  }
};

export const fetchUserBooks = async (
  uid,
  sortBy = 'title',
  order = 'asc'
) => {
  try {
    validateSortOptions(sortBy, order);
    const query = userBookCollection.where('uid', '==', uid);
    let userBooks = await executeQuery(query);

    userBooks = await combineBooksData(userBooks);
    userBooks = sortUserBooks(userBooks, sortBy, order);

    await logEntry({
      message: `User books fetched and sorted`,
      severity: 'INFO',
      uid,
      sortBy,
      order,
      bookCount: userBooks.length,
    });

    return userBooks;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error fetching user books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, sortBy, order, error: error.message }
    );
  }
};

export const createUserBookHelper = async ({ uid, bid, kataloged }) => {
  try {
    const existingBook = await userBookCollection
      .where('uid', '==', uid)
      .where('bid', '==', bid)
      .get();

    if (!existingBook.empty) {
      throw new HttpError(
        "This book already exists in the user's library",
        HttpStatusCodes.CONFLICT,
        ErrorCodes.RESOURCE_ALREADY_EXISTS,
        { uid, bid }
      );
    }

    const newUserBook = generateLowercaseFields({
      uid,
      bid,
      kataloged,
      updatedAtString: new Date().toISOString(),
    });

    const docRef = await userBookCollection.add(newUserBook);
    const ubid = docRef.id;
    await docRef.update({ ubid });
    const createdUserBook = await fetchUserBookById(ubid);

    await logEntry({
      message: `New user book created`,
      severity: 'INFO',
      ubid,
      uid,
      bid,
    });

    return createdUserBook;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error creating user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, bid, error: error.message }
    );
  }
};

export const updateUserBookHelper = async (ubid, updateData) => {
  try {
    const userBookRef = userBookCollection.doc(ubid);
    const userBookDoc = await userBookRef.get();

    if (!userBookDoc.exists) {
      throw new HttpError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid }
      );
    }

    const mergedData = {
      ...userBookDoc.data(),
      ...updateData,
      updatedAtString: new Date().toISOString(),
    };

    const updatedUserBook = generateLowercaseFields(mergedData);

    Object.keys(updatedUserBook).forEach((key) =>
      updatedUserBook[key] === undefined ? delete updatedUserBook[key] : {}
    );

    await userBookRef.update(updatedUserBook);
    const fetchedUpdatedUserBook = await fetchUserBookById(ubid);

    await logEntry({
      message: `User book updated`,
      severity: 'INFO',
      ubid,
      updatedFields: Object.keys(updateData),
    });

    return fetchedUpdatedUserBook;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error updating user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { ubid, updateData, error: error.message }
    );
  }
};

export const deleteUserBookHelper = async (ubid) => {
  try {
    const userBookRef = userBookCollection.doc(ubid);
    const userBookDoc = await userBookRef.get();

    if (!userBookDoc.exists) {
      throw new HttpError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid }
      );
    }

    await userBookRef.delete();

    await logEntry({
      message: `User book deleted`,
      severity: 'INFO',
      ubid,
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error deleting user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { ubid, error: error.message }
    );
  }
};
