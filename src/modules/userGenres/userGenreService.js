import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
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
    const dbError = new Error('Failed to map user genres from books');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { uid, error: error.message, requestId };
    throw dbError;
  }
};

export const fetchUserGenreBooks = async (uid, genre, requestId) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    const userBooks = await executeQuery(query, requestId);

    if (userBooks.length === 0) {
      const error = new Error('No books found for this user');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { uid, requestId };
      throw error;
    }

    const combinedBooks = await combineBooksData(userBooks, requestId);
    const genreBooks = combinedBooks.filter(
      (book) => book.genre === genre
    );

    if (genreBooks.length === 0) {
      const error = new Error('No books found for this genre');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { uid, genre, requestId };
      throw error;
    }

    return genreBooks;
  } catch (error) {
    const dbError = new Error('Failed to map books for user and genre');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { uid, genre, error: error.message, requestId };
    throw dbError;
  }
};
