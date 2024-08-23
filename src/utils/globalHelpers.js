import hashSum from 'hash-sum';
import HttpError from '../errors/httpErrorModel.js';
import { logEntry } from '../config/cloudLoggingConfig.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../errors/errorConstraints.js';

// Validation Helpers
export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new HttpError(
      error.details[0].message,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { data }
    );
  }
};

// Utility Helpers
export const generateId = (input) => {
  let uniqueString;

  if (typeof input === 'string') {
    // If input is a string (e.g., author name)
    uniqueString = `${input}-${Date.now()}`;
  } else if (typeof input === 'object' && input !== null) {
    // If input is an object (e.g., book data)
    if (!input.id || !input.etag) {
      throw new HttpError(
        'Invalid object for ID generation: missing id or etag',
        HttpStatusCodes.BAD_REQUEST,
        ErrorCodes.INVALID_INPUT,
        { input }
      );
    }
    uniqueString = `${input.id}-${input.etag}-${Date.now()}`;
  } else {
    throw new HttpError(
      'Invalid input for ID generation: must be a string or an object',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { input }
    );
  }

  return hashSum(uniqueString).substring(0, 28);
};

export const findISBN13 = (industryIdentifiers) => {
  if (!industryIdentifiers) return 'N/A';
  const isbn13 = industryIdentifiers.find((id) => id.type === 'ISBN_13');
  return isbn13 ? isbn13.identifier : 'N/A';
};

// Returns book card details
export const formatBookCoverResponse = (book) => {
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
    bid: book.id ? book.id : undefined,
    ubid: book.ubid ? book.ubid : undefined,
    imagePath: book.imagePath,
    title: book.title,
  };
};

// Saves lowercase title and author for create and update books
export const generateLowercaseFields = (book) => {
  if (!book || typeof book !== 'object') {
    throw new HttpError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: book.title }
    );
  }
  return {
    ...book,
    lowercaseTitle: book.title ? book.title.toLowerCase() : '',
    lowercaseAuthor: book.author ? book.author.toLowerCase() : '',
  };
};

// Sorting Helpers
export const removeCommonArticles = (title) => {
  const articlesRegex = /^(a |an |the )/i;
  return title.replace(articlesRegex, '').trim();
};

export const getLastName = (name) => {
  const nameArray = name.split(' ');
  return nameArray[nameArray.length - 1];
};

export const sortBooks = (items, sortBy, order) => {
  const compareFunction = (a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        const titleA = removeCommonArticles(a.title);
        const titleB = removeCommonArticles(b.title);
        comparison = titleA.localeCompare(titleB);
        break;
      case 'author':
        const aLastName = getLastName(a.author);
        const bLastName = getLastName(b.author);
        comparison = aLastName.localeCompare(bLastName);
        break;
      case 'updatedAt':
        const dateA = new Date(a.updatedAtString);
        const dateB = new Date(b.updatedAtString);
        comparison = dateA.getTime() - dateB.getTime();
        break;
      case 'name':
        const aName = a.name;
        const bName = b.name;
        comparison = aName.localeCompare(bName);
        break;
      case 'bookCount':
        comparison = (a.bookCount || 0) - (b.bookCount || 0);
        break;
      default:
        throw new HttpError(
          'Invalid sort field',
          HttpStatusCodes.BAD_REQUEST,
          ErrorCodes.INVALID_INPUT,
          { sortBy }
        );
    }

    return order === 'asc' ? comparison : -comparison;
  };

  const sortedItems = items.sort(compareFunction);

  logEntry({
    message: 'Items sorted',
    severity: 'INFO',
    sortBy,
    order,
    itemCount: sortedItems.length,
  }).catch(console.error);

  return sortedItems;
};

// Database Helpers
export const executeQuery = async (query) => {
  try {
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    throw new HttpError(
      'Error executing database query',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message }
    );
  }
};
