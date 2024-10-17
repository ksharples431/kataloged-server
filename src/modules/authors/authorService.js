import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
import { generateId, executeQuery } from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');

export const fetchAllAuthors = async (requestId) => {
  try {
    const query = bookCollection;
    const books = await executeQuery(query);
    const authorMap = new Map();

    books.forEach((book) => {
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
    const dbError = new Error('Failed to fetch authors');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { requestId, error: error.message };
    throw dbError;
  }
};

export const fetchAuthorBooks = async (author, requestId) => {
  try {
    const query = bookCollection.where('author', '==', author);
    const books = await executeQuery(query);

    if (books.length === 0) {
      const error = new Error('No books found for this author');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      throw error;
    }

    return books;
  } catch (error) {
    const dbError = new Error('Failed to fetch books for author');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { author, requestId, error: error.message };
    throw dbError;
  }
};
