import { fetchBookById } from './userBookService.js';
import HttpError from '../../../errors/httpErrorModel.js';

const combineBookData = async (userBook) => {
  try {
    const bookData = await fetchBookById(userBook.bid);
    return {
      ...bookData,
      ...userBook,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      return {
        ...userBook,
        bookError: error.message,
      };
    }
    throw new HttpError(
      `Failed to fetch book data for bid ${userBook.bid}`,
      500,
      'BOOK_FETCH_ERROR',
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

    return isArray ? combinedBooks : combinedBooks[0];
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error combining books data',
      500,
      'COMBINE_BOOKS_ERROR',
      { error: error.message }
    );
  }
};
