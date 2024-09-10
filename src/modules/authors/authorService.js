import db from '../../config/firebaseConfig.js';
import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';
import { generateId, executeQuery } from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');

export const fetchAllAuthors = async () => {
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
    throw createCustomError(
      'Failed to fetch authors',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};

export const fetchAuthorBooks = async (author) => {
  try {
    const query = bookCollection.where('author', '==', author);
    const books = await executeQuery(query);

    if (books.length === 0) {
      throw createCustomError(
        'No books found for this author',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { author, requestId },
        { category: ErrorCategories.CLIENT_ERROR.NOT_FOUND }
      );
    }

    return books;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Failed to fetch books for author',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { author, error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};
