import { generateBid, findISBN13 } from './utilityHelpers.js';
import HttpError from '../../../errors/httpErrorModel.js';
import { ErrorCodes, HttpStatusCodes } from '../../../errors/errorConstraints.js';

export const mapBookItem = (item) => {
  if (!item || !item.volumeInfo) {
    throw new HttpError(
      'Invalid book item',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { item }
    );
  }

  return {
    bid: generateBid(item),
    title: item.volumeInfo.title || 'Unknown Title',
    author: item.volumeInfo.authors?.[0] || 'Unknown Author',
    description: item.volumeInfo.description || '',
    genre: item.volumeInfo.categories?.[0] || 'Uncategorized',
    imagePath: item.volumeInfo.imageLinks?.thumbnail,
    isbn: findISBN13(item.volumeInfo.industryIdentifiers),
    lowercaseTitle: (item.volumeInfo.title || 'Unknown Title').toLowerCase(),
    lowercaseAuthor: (item.volumeInfo.authors?.[0] || 'Unknown Author').toLowerCase(),
  };
};