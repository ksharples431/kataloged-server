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

export const fetchAllUserGenres = async (uid, requestId) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    const userBooks = await executeQuery(query, requestId);
    const combinedBooks = await combineBooksData(userBooks, requestId);
    const genreMap = new Map();

    combinedBooks.forEach((book) => {
      const genreName = book.genre || 'Uncategorized';

      if (genreMap.has(genreName)) {
        const existingGenre = genreMap.get(genreName);
        existingGenre.bookCount += 1;
        if (book.updatedAtString > existingGenre.updatedAtString) {
          existingGenre.updatedAtString = book.updatedAtString;
        }
      } else {
        genreMap.set(genreName, {
          name: genreName,
          bookCount: 1,
          updatedAtString:
            book.updatedAtString || new Date().toISOString(),
          gid: generateId(genreName),
        });
      }
    });

    return Array.from(genreMap.values());
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Failed to map user genres from books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const fetchUserGenreBooks = async (uid, genre, requestId) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    const userBooks = await executeQuery(query, requestId);

    if (userBooks.length === 0) {
      throw createCustomError(
        'No books found for this user',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid, requestId },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    const combinedBooks = await combineBooksData(userBooks, requestId);

    const genreBooks = combinedBooks.filter(
      (book) => book.genre === genre
    );

    if (genreBooks.length === 0) {
      throw createCustomError(
        'No books found for this genre',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid, genre, requestId },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    return genreBooks;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Failed to map books for user and genre',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, genre, error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};
