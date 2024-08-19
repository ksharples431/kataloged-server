import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../models/httpErrorModel.js';
import {
  generateGid,
  formatGenreCoverResponse,
} from '../helpers/utilityHelpers.js';
import { combineBooksData } from '../../userBooks/services/combineBooksService.js';

const userBookCollection = db.collection('userBooks');

export const userGenreService = {
  mapUserGenresFromBooks: async (uid) => {
    try {
      console.log('Fetching user books for uid:', uid);

      const userBooksSnapshot = await userBookCollection
        .where('uid', '==', uid)
        .get();

      console.log('User books snapshot:', userBooksSnapshot);
      console.log('Is snapshot empty?', userBooksSnapshot.empty);

      if (userBooksSnapshot.empty) {
        console.log('No user books found for uid:', uid);
        return [];
      }

      let userBooks = userBooksSnapshot.docs.map((doc) => doc.data());
      userBooks = await combineBooksData(userBooks);

      const genreMap = new Map();

      userBooks.forEach((book) => {
        console.log('Processing book:', book);

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
            gid: generateGid(genreName),
          });
        }
      });

      const genres = Array.from(genreMap.values());
      console.log('Mapped genres:', genres);

      return genres;
    } catch (error) {
      console.error('Error mapping user genres from books:', error);
      throw new HttpError(
        'Failed to map user genres from books',
        500,
        'MAP_USER_GENRES_ERROR',
        { uid, error: error.message }
      );
    }
  },

  mapUserGenreBooks: async (uid, genre) => {
    try {
      const userBooksSnapshot = await userBookCollection
        .where('uid', '==', uid)
        .get();

      if (userBooksSnapshot.empty) {
        throw new HttpError(
          'No books found for this user',
          404,
          'USER_BOOKS_NOT_FOUND',
          { uid }
        );
      }

      let userBooks = userBooksSnapshot.docs.map((doc) => doc.data());
      userBooks = await combineBooksData(userBooks);

      const genreBooks = userBooks.filter((book) => book.genre === genre);

      if (genreBooks.length === 0) {
        throw new HttpError(
          'No books found for this genre',
          404,
          'GENRE_BOOKS_NOT_FOUND',
          { uid, genre }
        );
      }

      return genreBooks.map(formatGenreCoverResponse);
    } catch (error) {
      console.error(
        `Error mapping books for user ${uid} and genre ${genre}:`,
        error
      );
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        'Failed to map books for user and genre',
        500,
        'MAP_USER_GENRE_BOOKS_ERROR',
        { uid, genre, error: error.message }
      );
    }
  },
};
