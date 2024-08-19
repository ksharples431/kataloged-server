import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../models/httpErrorModel.js';
import {
  generateAid,
  formatAuthorCoverResponse,
} from '../helpers/utilityHelpers.js';

const bookCollection = db.collection('books');

export const authorService = {
  mapAuthorsFromBooks: async () => {
    try {
      const booksSnapshot = await bookCollection.get();
      const authorMap = new Map();

      booksSnapshot.forEach((doc) => {
        const book = doc.data();
        const authorName = book.author;
        if (authorName) {
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
        }
      });

      return Array.from(authorMap.values());
    } catch (error) {
      console.error('Error mapping authors from books:', error);
      throw new HttpError(
        'Failed to map authors from books',
        500,
        'MAP_AUTHORS_ERROR',
        { error: error.message }
      );
    }
  },

  mapAuthorBooks: async (author) => {
    try {
      const booksSnapshot = await bookCollection
        .where('author', '==', author)
        .get();

      if (booksSnapshot.empty) {
        throw new HttpError(
          'No books found for this author',
          404,
          'AUTHOR_BOOKS_NOT_FOUND',
          { author }
        );
      }

      return booksSnapshot.docs.map((doc) => {
        const book = {
          id: generateAid(doc),
          ...doc.data(),
        };
        return formatAuthorCoverResponse(book);
      });
    } catch (error) {
      console.error(`Error mapping books for author ${author}:`, error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        'Failed to map books for author',
        500,
        'MAP_AUTHOR_BOOKS_ERROR',
        { author, error: error.message }
      );
    }
  },
};
