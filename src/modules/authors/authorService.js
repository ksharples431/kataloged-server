import db from '../../config/firebaseConfig.js';
import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import { generateId } from '../../utils/globalHelpers.js';

const bookCollection = db.collection('books');

export const fetchAllAuthors = async () => {
  try {
    const booksSnapshot = await bookCollection.get();
    const authorMap = new Map();

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
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

    const authors = Array.from(authorMap.values());

    return authors;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to fetch authors',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message }
    );
  }
};

export const fetchAuthorBooks = async (author) => {
  try {
    const booksSnapshot = await bookCollection
      .where('author', '==', author)
      .get();

    if (booksSnapshot.empty) {
      throw new HttpError(
        'No books found for this author',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { author }
      );
    }

    let authorBooks = booksSnapshot.docs.map((doc) => doc.data());

    return authorBooks;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to fetch books for author',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { author, error: error.message }
    );
  }
};
