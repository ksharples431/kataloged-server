import hashSum from 'hash-sum';
import HttpError from '../../../models/httpErrorModel.js';

export const formatBookCoverResponse = (book) => {
  try {
    return {
      author: book.author,
      bid: book.bid,
      imagePath: book.imagePath,
      title: book.title,
    };
  } catch (error) {
    throw new HttpError(
      'Error formatting book cover response',
      500,
      'BOOK_COVER_FORMAT_ERROR',
      { book }
    );
  }
};

export const formatBookDetailsResponse = (book) => {
  try {
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
  } catch (error) {
    throw new HttpError(
      'Error formatting book details response',
      500,
      'BOOK_DETAILS_FORMAT_ERROR',
      { book }
    );
  }
};

export const generateLowercaseFields = (book) => {
  try {
    return {
      ...book,
      lowercaseTitle: book.title ? book.title.toLowerCase() : '',
      lowercaseAuthor: book.author ? book.author.toLowerCase() : '',
    };
  } catch (error) {
    throw new HttpError(
      'Error generating lowercase fields',
      500,
      'LOWERCASE_FIELDS_ERROR',
      { book }
    );
  }
};

export const generateBid = (item) => {
  try {
    const uniqueString = `${item.id}-${item.etag}-${Date.now()}`;
    return hashSum(uniqueString).substring(0, 28);
  } catch (error) {
    throw new HttpError(
      'Error generating BID',
      500,
      'BID_GENERATION_ERROR',
      { item }
    );
  }
};

export const findISBN13 = (industryIdentifiers) => {
  try {
    if (!industryIdentifiers) return 'N/A';
    const isbn13 = industryIdentifiers.find((id) => id.type === 'ISBN_13');
    return isbn13 ? isbn13.identifier : 'N/A';
  } catch (error) {
    throw new HttpError('Error finding ISBN13', 500, 'ISBN13_FIND_ERROR', {
      industryIdentifiers,
    });
  }
};
