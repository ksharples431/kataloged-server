import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorConstraints.js';

export const formatBookDetailsResponse = (book, requestId) => {
  if (!book || typeof book !== 'object') {
    throw createCustomError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: book?.title, requestId },
      { category: ErrorCategories.SERVER_ERROR.INTERNAL }
    );
  }
  return {
    author: book.author,
    bid: book.bid,
    description: book.description,
    genre: book.genre,
    imagePath: book.imagePath,
    isbn: book.isbn,
    seriesName: book.seriesName,
    seriesNumber: book.seriesNumber,
    title: book.title,
  };
};
