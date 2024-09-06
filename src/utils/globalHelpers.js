import hashSum from 'hash-sum';
import { createCustomError } from '../errors/customError.js';
import admin from 'firebase-admin';

import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../errors/errorConstraints.js';

// Validation Helpers
export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw createCustomError(
      error.details[0].message,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { data },
      { category: ErrorCategories.CLIENT_ERROR.VALIDATION }
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
      throw createCustomError(
        'Invalid object for ID generation: missing id or etag',
        HttpStatusCodes.BAD_REQUEST,
        ErrorCodes.INVALID_INPUT,
        { input },
        { category: ErrorCategories.CLIENT_ERROR.VALIDATION }
      );
    }
    uniqueString = `${input.id}-${input.etag}-${Date.now()}`;
  } else {
    throw createCustomError(
      'Invalid input for ID generation: must be a string or an object',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { input },
      { category: ErrorCategories.CLIENT_ERROR.VALIDATION }
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
    throw createCustomError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: book?.title },
      { category: ErrorCategories.SERVER_ERROR.INTERNAL }
    );
  }
  return {
    author: book.author,
    bid: book.bid,
    ubid: book.ubid,
    imagePath: book.imagePath,
    title: book.title,
  };
};

// Saves lowercase title and author for create and update books
export const generateLowercaseFields = (book) => {
  if (!book || typeof book !== 'object') {
    throw createCustomError(
      'Invalid book object',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: book?.title },
      { category: ErrorCategories.SERVER_ERROR.INTERNAL }
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
        throw createCustomError(
          'Invalid sort field',
          HttpStatusCodes.BAD_REQUEST,
          ErrorCodes.INVALID_INPUT,
          { sortBy },
          { category: ErrorCategories.CLIENT_ERROR.VALIDATION }
        );
    }

    return order === 'asc' ? comparison : -comparison;
  };

  const sortedItems = items.sort(compareFunction);

  return sortedItems;
};

// Database Helpers
export const executeQuery = async (queryOrDocRef) => {
  try {
    let result;
    if (queryOrDocRef instanceof admin.firestore.Query) {
      // It's a query
      const snapshot = await queryOrDocRef.get();
      result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else if (
      queryOrDocRef instanceof admin.firestore.DocumentReference
    ) {
      // It's a document reference
      const doc = await queryOrDocRef.get();
      result = doc.exists ? [{ id: doc.id, ...doc.data() }] : [];
    } else {
      throw new Error(
        'Invalid input: expected a Firestore query or document reference'
      );
    }
    return result;
  } catch (error) {
    throw createCustomError(
      'Error executing database query',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
};
