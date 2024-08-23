import db from '../../config/firebaseConfig.js';
import HttpError from '../../errors/httpErrorModel.js';
import { logEntry } from '../../config/cloudLoggingConfig.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import { generateId } from '../../utils/globalHelpers.js';
import { combineBooksData } from '../userBooks/userBookService.js';

const userBookCollection = db.collection('userBooks');

export const fetchAllUserGenres = async (uid) => {
  try {
    const userBooksSnapshot = await userBookCollection
      .where('uid', '==', uid)
      .get();
    const genreMap = new Map();

    let userBooks = userBooksSnapshot.docs.map((doc) => doc.data());
    userBooks = await combineBooksData(userBooks);

    userBooks.forEach((book) => {
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

    const genres = Array.from(genreMap.values());

    await logEntry({
      message: 'User genres mapped from books',
      severity: 'INFO',
      uid,
      genreCount: genres.length,
    });

    return genres;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to map user genres from books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, error: error.message }
    );
  }
};

export const fetchUserGenreBooks = async (uid, genre) => {
  try {
    const userBooksSnapshot = await userBookCollection
      .where('uid', '==', uid)
      .get();

    if (userBooksSnapshot.empty) {
      throw new HttpError(
        'No books found for this user',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid }
      );
    }

    let userBooks = userBooksSnapshot.docs.map((doc) => doc.data());
    userBooks = await combineBooksData(userBooks);

    const genreBooks = userBooks.filter((book) => book.genre === genre);

    if (genreBooks.length === 0) {
      throw new HttpError(
        'No books found for this genre',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid, genre }
      );
    }

    await logEntry({
      message: 'User genre books mapped',
      severity: 'INFO',
      uid,
      genre,
      bookCount: genreBooks.length,
    });

    return genreBooks;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to map books for user and genre',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, genre, error: error.message }
    );
  }
};
