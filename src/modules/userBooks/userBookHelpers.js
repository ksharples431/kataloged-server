import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorMappings.js';

export const formatUserBookDetailsResponse = (userBook, requestId) => {
  if (!userBook || typeof userBook !== 'object') {
    throw createCustomError(
      'Invalid user book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: userBook?.title, requestId },
      { category: ErrorCategories.SERVER_ERROR.INTERNAL }
    );
  }
  return {
    author: userBook.author,
    ubid: userBook.ubid,
    description: userBook.description,
    genre: userBook.genre,
    imagePath: userBook.imagePath,
    isbn: userBook.isbn,
    seriesName: userBook.seriesName,
    seriesNumber: userBook.seriesNumber,
    title: userBook.title,
    favorite: userBook.favorite,
    kataloged: userBook.kataloged,
    owned: userBook.owned,
    wishlist: userBook.wishlist,
    format: userBook.format,
    whereToGet: userBook.whereToGet,
    progress: userBook.progress,
  };
};
