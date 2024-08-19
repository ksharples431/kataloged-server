import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../models/httpErrorModel.js';
import {
  generateGid,
  formatGenreCoverResponse,
} from '../helpers/utilityHelpers.js';

const bookCollection = db.collection('books');

export const genreService = {
  mapGenresFromBooks: async () => {
    try {
      const booksSnapshot = await bookCollection.get();
      const genreMap = new Map();

      booksSnapshot.forEach((doc) => {
        const book = doc.data();
        const genreName = book.genre;
        if (genreName) {
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
        }
      });

      return Array.from(genreMap.values());
    } catch (error) {
      console.error('Error mapping genres from books:', error);
      throw new HttpError(
        'Failed to map genres from books',
        500,
        'MAP_GENRES_ERROR',
        { error: error.message }
      );
    }
  },

  mapGenreBooks: async (genre) => {
    try {
      const booksSnapshot = await bookCollection
        .where('genre', '==', genre)
        .get();

      if (booksSnapshot.empty) {
        throw new HttpError(
          'No books found for this genre',
          404,
          'GENRE_BOOKS_NOT_FOUND',
          { genre }
        );
      }

      return booksSnapshot.docs.map((doc) => {
        const book = {
          id: generateGid(doc),
          ...doc.data(),
        };
        return formatGenreCoverResponse(book);
      });
    } catch (error) {
      console.error(`Error mapping books for genre ${genre}:`, error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        'Failed to map books for genre',
        500,
        'MAP_GENRE_BOOKS_ERROR',
        { genre, error: error.message }
      );
    }
  },
};
