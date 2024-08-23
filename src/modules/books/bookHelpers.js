import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';

export const formatBookDetailsResponse = (book) => {
  if (!book || typeof book !== 'object') {
    throw new HttpError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: book?.title }
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

