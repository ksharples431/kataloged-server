import db from '../../config/firebaseConfig.js';
import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
import { generateId, executeQuery } from '../../utils/globalHelpers.js';
import { combineBooksData } from '../userBooks/userBookService.js';

const userBookCollection = db.collection('userBooks');

export const fetchAllUserAuthors = async (uid) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    const userBooks = await executeQuery(query);
    const combinedBooks = await combineBooksData(userBooks);
    const authorMap = new Map();

    combinedBooks.forEach((book) => {
      const authorName = book.author;

      if (authorMap.has(authorName)) {
        const existingAuthor = authorMap.get(authorName);
        existingAuthor.bookCount += 1;
        if (book.updatedAtString > existingAuthor.updatedAtString) {
          existingAuthor.updatedAtString = book.updatedAtString;
        }
      } else {
        authorMap.set(authorName, {
          name: authorName,
          bookCount: 1,
          updatedAtString:
            book.updatedAtString || new Date().toISOString(),
          aid: generateId(authorName),
        });
      }
    });

    return Array.from(authorMap.values());
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Failed to map user authors from books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const fetchUserAuthorBooks = async (uid, author) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    const userBooks = await executeQuery(query);

    if (userBooks.length === 0) {
      throw createCustomError(
        'No books found for this user',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    const combinedBooks = await combineBooksData(userBooks);
    const authorBooks = combinedBooks.filter(
      (book) => book.author === author
    );

    if (authorBooks.length === 0) {
      throw createCustomError(
        'No books found for this author',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid, author },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    return authorBooks;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Failed to map books for user and author',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, author, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};
