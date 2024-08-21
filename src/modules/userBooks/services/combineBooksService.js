import HttpError from '../../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';
import { logEntry } from '../../../config/cloudLoggingConfig.js';
import { fetchBookById } from './userBookService.js';

const combineBookData = async (userBook) => {
  try {
    const bookData = await fetchBookById(userBook.bid);
    return {
      ...bookData,
      ...userBook,
    };
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.statusCode === HttpStatusCodes.NOT_FOUND
    ) {
      await logEntry({
        message: `Book not found for user book`,
        severity: 'WARNING',
        ubid: userBook.ubid,
        bid: userBook.bid,
      });
      return {
        ...userBook,
        bookError: error.message,
      };
    }
    throw new HttpError(
      `Failed to fetch book data for bid ${userBook.bid}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { bid: userBook.bid, error: error.message }
    );
  }
};

export const combineBooksData = async (userBooks) => {
  try {
    const isArray = Array.isArray(userBooks);
    const booksToProcess = isArray ? userBooks : [userBooks];

    const combinedBooks = await Promise.all(
      booksToProcess.map(combineBookData)
    );

    await logEntry({
      message: `Books data combined`,
      severity: 'INFO',
      count: combinedBooks.length,
    });

    return isArray ? combinedBooks : combinedBooks[0];
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error combining books data',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message }
    );
  }
};
