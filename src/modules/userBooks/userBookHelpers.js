import { HttpStatusCodes } from '../../errors/errorCategories.js';

export const formatUserBookDetailsResponse = (userBook, requestId) => {
  if (!userBook || typeof userBook !== 'object') {
    const error = new Error('Invalid user book object');
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.details = { title: userBook?.title, requestId };
    throw error;
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
