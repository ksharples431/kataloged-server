import { HttpStatusCodes } from '../../errors/errorCategories.js';

/**
 * Formats the book details response. Throws an error if the book object is invalid.
 *
 * @param {Object} book - The book object.
 * @param {string} requestId - The request ID for logging purposes.
 * @returns {Object} - The formatted book object.
 */
export const formatBookDetailsResponse = (book, requestId) => {
  if (!book || typeof book !== 'object') {
    const error = new Error('Invalid book object');
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.requestId = requestId;
    throw error; // Pass this error to the global error handler
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
