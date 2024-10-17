import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
import {
  executeQuery,
  generateLowercaseFields,
} from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');
const userBookCollection = db.collection('userBooks');

export const fetchBookById = async (bid, requestId) => {
  try {
    const query = bookCollection.doc(bid);
    const [book] = await executeQuery(query, requestId);

    if (!book) {
      const error = new Error('Book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { bid, requestId };
      throw error;
    }

    return book;
  } catch (error) {
    const dbError = new Error(`Error fetching book: ${error.message}`);
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};

export const fetchUserBookById = async (ubid, requestId) => {
  try {
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query, requestId);

    if (!userBook) {
      const error = new Error('User book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { ubid, requestId };
      throw error;
    }

    const combinedBook = await combineBooksData(userBook, requestId);
    return combinedBook;
  } catch (error) {
    const dbError = new Error(
      `Error fetching user book: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};

export const fetchUserBooks = async (uid, sortBy, order, requestId) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    let userBooks = await executeQuery(query, requestId);
    userBooks = await combineBooksData(userBooks, requestId);

    return userBooks;
  } catch (error) {
    const dbError = new Error(
      `Error fetching user books: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};

export const createUserBookHelper = async (
  { uid, bid, kataloged },
  requestId
) => {
  try {
    const query = userBookCollection
      .where('uid', '==', uid)
      .where('bid', '==', bid);
    const existingBooks = await executeQuery(query, requestId);

    if (existingBooks.length > 0) {
      const error = new Error(
        "This book already exists in the user's library"
      );
      error.statusCode = HttpStatusCodes.CONFLICT;
      error.details = { uid, bid, requestId };
      throw error;
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
    return await fetchUserBookById(ubid, requestId);
  } catch (error) {
    const dbError = new Error(
      `Error creating user book: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};

export const updateUserBookHelper = async (
  ubid,
  updateData,
  requestId
) => {
  try {
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query, requestId);

    if (!userBook) {
      const error = new Error('User book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { ubid, requestId };
      throw error;
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
    return await fetchUserBookById(ubid, requestId);
  } catch (error) {
    const dbError = new Error(
      `Error updating user book: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};

export const deleteUserBookHelper = async (ubid, requestId) => {
  try {
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query, requestId);

    if (!userBook) {
      const error = new Error('User book not found');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { ubid, requestId };
      throw error;
    }

    await userBookCollection.doc(ubid).delete();
    return true;
  } catch (error) {
    const dbError = new Error(
      `Error deleting user book: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};

const combineBookData = async (userBook, requestId) => {
  try {
    const bookData = await fetchBookById(userBook.bid, requestId);
    return { ...bookData, ...userBook };
  } catch (error) {
    if (error.statusCode === HttpStatusCodes.NOT_FOUND) {
      return { ...userBook, bookError: error.message };
    }
    const dbError = new Error(
      `Failed to fetch book data for bid ${userBook.bid}: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};

export const combineBooksData = async (userBooks, requestId) => {
  try {
    const isArray = Array.isArray(userBooks);
    const booksToProcess = isArray ? userBooks : [userBooks];

    const combinedBooks = await Promise.all(
      booksToProcess.map((book) => combineBookData(book, requestId))
    );

    return isArray ? combinedBooks : combinedBooks[0];
  } catch (error) {
    const dbError = new Error(
      `Error combining books data: ${error.message}`
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw dbError;
  }
};
