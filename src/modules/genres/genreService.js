import db from '../../config/firebaseConfig.js';
import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
import { generateId, executeQuery } from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');

export const fetchAllGenres = async () => {
  try {
    const query = bookCollection;
    const books = await executeQuery(query);
    const genreMap = new Map();

    books.forEach((book) => {
      const genreName = book.genre;

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
    throw createCustomError(
      'Failed to map genres from books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const fetchGenreBooks = async (genre) => {
  try {
    const query = bookCollection.where('genre', '==', genre);
    const genreBooks = await executeQuery(query);

    if (genreBooks.length === 0) {
      throw createCustomError(
        'No books found for this genre',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { genre },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    return genreBooks;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Failed to map books for genre',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { genre, error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};
