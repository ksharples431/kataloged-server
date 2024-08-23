import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';

export const formatUserBookDetailsResponse = (userBook) => {
  if (!userBook || typeof userBook !== 'object') {
    throw new HttpError(
      'Invalid user book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: userBook?.title }
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


