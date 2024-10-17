import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
import { generateId, executeQuery } from '../../utils/globalHelpers.js';
import { combineBooksData } from '../userBooks/userBookService.js';

const userBookCollection = db.collection('userBooks');

export const fetchAllUserAuthors = async (uid, requestId) => {
  try {
    const query = userBookCollection.where('uid', '==', uid);
    const userBooks = await executeQuery(query, requestId);
    const combinedBooks = await combineBooksData(userBooks, requestId);
    const authorMap = new Map();

    combinedBooks.forEach((book) => {
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
    const dbError = new Error('Failed to map user authors from books');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { uid, error: error.message, requestId };
    throw dbError;
  }
};

export const fetchUserAuthorBooks = async (uid, author, requestId) => {
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
    const authorBooks = combinedBooks.filter(
      (book) => book.author === author
    );

    if (authorBooks.length === 0) {
      const error = new Error('No books found for this author');
      error.statusCode = HttpStatusCodes.NOT_FOUND;
      error.details = { uid, author, requestId };
      throw error;
    }

    return authorBooks;
  } catch (error) {
    const dbError = new Error('Failed to map books for user and author');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { uid, author, error: error.message, requestId };
    throw dbError;
  }
};
