import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../errors/httpErrorModel.js';
import {
  generateAid,
  formatAuthorCoverResponse,
} from '../helpers/utilityHelpers.js';
import { combineBooksData } from '../../userBooks/services/combineBooksService.js';

const userBookCollection = db.collection('userBooks');

export const userAuthorService = {
  mapUserAuthorsFromBooks: async (uid) => {
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

      const authorMap = new Map();

      userBooks.forEach((book) => {
        console.log('Processing book:', book);

        const authorName = book.author || 'Unknown Author';
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
            aid: generateAid(authorName),
          });
        }
      });

      const authors = Array.from(authorMap.values());
      console.log('Mapped authors:', authors);

      return authors;
    } catch (error) {
      console.error('Error mapping user authors from books:', error);
      throw new HttpError(
        'Failed to map user authors from books',
        500,
        'MAP_USER_AUTHORS_ERROR',
        { uid, error: error.message }
      );
    }
  },

  mapUserAuthorBooks: async (uid, author) => {
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

      const authorBooks = userBooks.filter(
        (book) => book.author === author
      );

      if (authorBooks.length === 0) {
        throw new HttpError(
          'No books found for this author',
          404,
          'AUTHOR_BOOKS_NOT_FOUND',
          { uid, author }
        );
      }

      return authorBooks.map(formatAuthorCoverResponse);
    } catch (error) {
      console.error(
        `Error mapping books for user ${uid} and author ${author}:`,
        error
      );
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        'Failed to map books for user and author',
        500,
        'MAP_USER_AUTHOR_BOOKS_ERROR',
        { uid, author, error: error.message }
      );
    }
  },
};
