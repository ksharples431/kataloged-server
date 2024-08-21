import hashSum from 'hash-sum';
import HttpError from '../../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';

export const formatBookCoverResponse = (book) => {
  if (!book || typeof book !== 'object') {
    throw new HttpError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { book }
    );
  }
  return {
    author: book.author,
    bid: book.bid,
    imagePath: book.imagePath,
    title: book.title,
  };
};

export const formatBookDetailsResponse = (book) => {
  if (!book || typeof book !== 'object') {
    throw new HttpError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { book }
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

export const generateLowercaseFields = (book) => {
  if (!book || typeof book !== 'object') {
    throw new HttpError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { book }
    );
  }
  return {
    ...book,
    lowercaseTitle: book.title ? book.title.toLowerCase() : '',
    lowercaseAuthor: book.author ? book.author.toLowerCase() : '',
  };
};

export const generateBid = (item) => {
  if (!item || !item.id || !item.etag) {
    throw new HttpError(
      'Invalid item for BID generation',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { item }
    );
  }
  const uniqueString = `${item.id}-${item.etag}-${Date.now()}`;
  return hashSum(uniqueString).substring(0, 28);
};

export const findISBN13 = (industryIdentifiers) => {
  if (!industryIdentifiers) return 'N/A';
  const isbn13 = industryIdentifiers.find((id) => id.type === 'ISBN_13');
  return isbn13 ? isbn13.identifier : 'N/A';
};
