import db from '../../config/firebaseConfig.js';
import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
import {
  executeQuery,
  generateLowercaseFields,
} from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid) => {
  try {
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query);

    if (!book) {
      throw createCustomError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    return book;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error fetching book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const fetchUserBookById = async (ubid) => {
  try {
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query);

    if (!userBook) {
      throw createCustomError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    const combinedBook = await combineBooksData(userBook);

    return combinedBook;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error fetching user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { ubid, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const fetchUserBooks = async (uid) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    let userBooks = await executeQuery(query);
    userBooks = await combineBooksData(userBooks);

    return userBooks;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error fetching user books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const createUserBookHelper = async ({ uid, bid, kataloged }) => {
  try {
    const query = userBookCollection
      .where('uid', '==', uid)
      .where('bid', '==', bid);
    const existingBooks = await executeQuery(query);

    if (existingBooks.length > 0) {
      throw createCustomError(
        "This book already exists in the user's library",
        HttpStatusCodes.CONFLICT,
        ErrorCodes.RESOURCE_ALREADY_EXISTS,
        { uid, bid },
        { category: ErrorCategories.CLIENT_ERROR.CONFLICT }
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

    return createdUserBook;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error creating user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, bid, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const updateUserBookHelper = async (ubid, updateData) => {
  try {
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query);

    if (!userBook) {
      throw createCustomError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    const mergedData = {
      ...userBook,
      ...updateData,
      updatedAtString: new Date().toISOString(),
    };

    const updatedUserBook = generateLowercaseFields(mergedData);

    Object.keys(updatedUserBook).forEach((key) =>
      updatedUserBook[key] === undefined ? delete updatedUserBook[key] : {}
    );

    await userBookCollection.doc(ubid).update(updatedUserBook);
    const fetchedUpdatedUserBook = await fetchUserBookById(ubid);

    return fetchedUpdatedUserBook;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error updating user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { ubid, updateData, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const deleteUserBookHelper = async (ubid) => {
  try {
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query);

    if (!userBook) {
      throw createCustomError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    await userBookCollection.doc(ubid).delete();
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error deleting user book',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { ubid, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

const combineBookData = async (userBook) => {
  try {
    const bookData = await fetchBookById(userBook.bid);

    return {
      ...bookData,
      ...userBook,
    };
  } catch (error) {
    if (
      error.name === 'CustomError' &&
      error.statusCode === HttpStatusCodes.NOT_FOUND
    ) {
      return {
        ...userBook,
        bookError: error.message,
      };
    }
    throw createCustomError(
      `Failed to fetch book data for bid ${userBook.bid}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid: userBook.bid, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const combineBooksData = async (userBooks) => {
  try {
    const isArray = Array.isArray(userBooks);
    const booksToProcess = isArray ? userBooks : [userBooks];

    const combinedBooks = await Promise.all(
      booksToProcess.map(combineBookData)
    );

    return isArray ? combinedBooks : combinedBooks[0];
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error combining books data',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};
