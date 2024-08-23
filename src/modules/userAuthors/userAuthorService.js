import db from '../../config/firebaseConfig.js';
import HttpError from '../../errors/httpErrorModel.js';

import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import { generateId } from '../../utils/globalHelpers.js';
import { combineBooksData } from '../userBooks/userBookService.js';

const userBookCollection = db.collection('userBooks');

export const fetchAllUserAuthors = async (uid) => {
  try {
    const userBooksSnapshot = await userBookCollection
      .where('uid', '==', uid)
      .get();
    const authorMap = new Map();

    let userBooks = userBooksSnapshot.docs.map((doc) => doc.data());
    userBooks = await combineBooksData(userBooks);

    userBooks.forEach((book) => {
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
      'Failed to map user authors from books',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, error: error.message }
    );
  }
};

export const fetchUserAuthorBooks = async (uid, author) => {
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

    const authorBooks = userBooks.filter((book) => book.author === author);

    if (authorBooks.length === 0) {
      throw new HttpError(
        'No books found for this author',
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { uid, author }
      );
    }

    

    return authorBooks;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Failed to map books for user and author',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, author, error: error.message }
    );
  }
};
