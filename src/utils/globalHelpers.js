import hashSum from 'hash-sum';
import admin from 'firebase-admin';
import { HttpStatusCodes } from '../errors/errorCategories.js';

// Validation Helpers
export const validateInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.statusCode = HttpStatusCodes.BAD_REQUEST;
    validationError.details = { data };
    throw validationError;
  }
};

// Utility Helpers
export const generateId = (input) => {
  let uniqueString;

  if (typeof input === 'string') {
    uniqueString = `${input}-${Date.now()}`;
  } else if (typeof input === 'object' && input !== null) {
    if (!input.id || !input.etag) {
      const error = new Error(
        'Invalid object for ID generation: missing id or etag'
      );
      error.statusCode = HttpStatusCodes.BAD_REQUEST;
      error.details = { input };
      throw error;
    }
    uniqueString = `${input.id}-${input.etag}-${Date.now()}`;
  } else {
    const error = new Error(
      'Invalid input for ID generation: must be a string or an object'
    );
    error.statusCode = HttpStatusCodes.BAD_REQUEST;
    error.details = { input };
    throw error;
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
    const error = new Error('Invalid book object');
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.details = { title: book?.title };
    throw error;
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
    const error = new Error('Invalid book object');
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    error.details = { title: book?.title };
    throw error;
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
        const error = new Error('Invalid sort field');
        error.statusCode = HttpStatusCodes.BAD_REQUEST;
        error.details = { sortBy };
        throw error;
    }

    return order === 'asc' ? comparison : -comparison;
  };

  return items.sort(compareFunction);
};

// Database Helpers
export const executeQuery = async (queryOrDocRef) => {
  try {
    let result;
    if (queryOrDocRef instanceof admin.firestore.Query) {
      const snapshot = await queryOrDocRef.get();
      result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else if (
      queryOrDocRef instanceof admin.firestore.DocumentReference
    ) {
      const doc = await queryOrDocRef.get();
      result = doc.exists ? [{ id: doc.id, ...doc.data() }] : [];
    } else {
      throw new Error(
        'Invalid input: expected a Firestore query or document reference'
      );
    }
    return result;
  } catch (error) {
    const dbError = new Error('Error executing database query');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { error: error.message };
    throw dbError;
  }
};
