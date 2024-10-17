import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
import { generateId, executeQuery } from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');

export const fetchAllGenres = async (requestId) => {
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
    const dbError = new Error('Failed to map genres from books');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { requestId, error: error.message };
    throw dbError;
  }
};

export const fetchGenreBooks = async (genre, requestId) => {
  try {
    const query = bookCollection.where('genre', '==', genre);
    const genreBooks = await executeQuery(query);

    if (genreBooks.length === 0) {
      const error = new Error('No books found for this genre');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { genre, requestId };
      throw error;
    }

    return genreBooks;
  } catch (error) {
    const dbError = new Error('Failed to map books for genre');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { genre, requestId, error: error.message };
    throw dbError;
  }
};
