import db from '../../config/firebaseConfig.js';
import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
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
      throw new HttpError(
        'Book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { bid }
      );
    }

    return book;
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
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query);

    if (!userBook) {
      throw new HttpError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid }
      );
    }

    const combinedBook = await combineBooksData(userBook);

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

export const fetchUserBooks = async (uid) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    let userBooks = await executeQuery(query);
    userBooks = await combineBooksData(userBooks);

    return userBooks;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error fetching user books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, error: error.message }
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
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query);

    if (!userBook) {
      throw new HttpError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid }
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
    const query = userBookCollection.doc(ubid);
    const [userBook] = await executeQuery(query);

    if (!userBook) {
      throw new HttpError(
        'User book not found',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { ubid }
      );
    }

    await userBookCollection.doc(ubid).delete();
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

const combineBookData = async (userBook) => {
  try {
    const bookData = await fetchBookById(userBook.bid);

    return {
      ...bookData,
      ...userBook,
    };
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.statusCode === HttpStatusCodes.NOT_FOUND
    ) {
      return {
        ...userBook,
        bookError: error.message,
      };
    }
    throw new HttpError(
      `Failed to fetch book data for bid ${userBook.bid}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid: userBook.bid, error: error.message }
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
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error combining books data',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message }
    );
  }
};
