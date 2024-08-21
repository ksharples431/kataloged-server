import db from '../../../config/firebaseConfig.js';
import axios from 'axios';
import HttpError from '../../../errors/httpErrorModel.js';
import { mapBookItem } from '../helpers/mappingHelpers.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';

const bookCollection = db.collection('books');
const GOOGLE_BOOKS_API_URL = process.env.GOOGLE_BOOKS_API_URL;
const MAX_RESULTS = 20;

export const buildQuery = ({ title, author, isbn }) => {
  let query = bookCollection;

  if (isbn) {
    return query.where('isbn', '==', isbn);
  } else if (title && author) {
    const titleLower = title.toLowerCase();
    const authorLower = author.toLowerCase();
    return query
      .where('lowercaseTitle', '>=', titleLower)
      .where('lowercaseTitle', '<', titleLower + '\uf8ff')
      .where('lowercaseAuthor', '>=', authorLower)
      .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
  } else if (title) {
    const titleLower = title.toLowerCase();
    return query
      .where('lowercaseTitle', '>=', titleLower)
      .where('lowercaseTitle', '<', titleLower + '\uf8ff');
  } else if (author) {
    const authorLower = author.toLowerCase();
    return query
      .where('lowercaseAuthor', '>=', authorLower)
      .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
  }

  return query;
};

export const buildGoogleQuery = ({ title, author, isbn }) => {
  if (isbn) {
    return `isbn:${isbn}`;
  } else if (title && author) {
    return `intitle:${title}+inauthor:${author}`;
  } else if (title) {
    return `intitle:${title}`;
  } else if (author) {
    return `inauthor:${author}`;
  }
  throw new HttpError(
    'Invalid search parameters',
    HttpStatusCodes.BAD_REQUEST,
    ErrorCodes.INVALID_INPUT,
    { title, author, isbn }
  );
};

export const buildGeneralSearchQuery = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return new Promise(async (resolve, reject) => {
    const titleSnapshot = await bookCollection
      .where('lowercaseTitle', '>=', lowercaseQuery)
      .where('lowercaseTitle', '<=', lowercaseQuery + '\uf8ff')
      .get();

    const authorSnapshot = await bookCollection
      .where('lowercaseAuthor', '>=', lowercaseQuery)
      .where('lowercaseAuthor', '<=', lowercaseQuery + '\uf8ff')
      .get();

    let results = [
      ...titleSnapshot.docs.map((doc) => doc.data()),
      ...authorSnapshot.docs.map((doc) => doc.data()),
    ];

    // Remove duplicates
    results = Array.from(new Set(results.map(JSON.stringify))).map(
      JSON.parse
    );

    resolve(results);
  });
};

export const executeQuery = async (query) => {
  if (query instanceof Promise) {
    // If query is a Promise (as in the case of buildGeneralSearchQuery), await it
    const snapshot = await query;
    return snapshot;
  } else {
    // If query is a Firestore Query object, execute get() and return the result
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  }
};

export const buildRequestConfig = (googleQuery) => {
  return {
    params: {
      q: googleQuery,
      key: process.env.GOOGLE_BOOKS_API_KEY,
      maxResults: MAX_RESULTS,
    },
    headers: {
      Referer: process.env.APP_URL_PROD || process.env.APP_URL_LOCAL,
    },
  };
};

export const fetchBooksFromGoogleAPI = async (config) => {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new HttpError(
        'Google Books API Error',
        error.response?.status || HttpStatusCodes.INTERNAL_SERVER_ERROR,
        ErrorCodes.API_REQUEST_FAILED,
        { message: error.message }
      );
    }
    throw new HttpError(
      'Unknown error occurred while fetching books from Google API',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.UNEXPECTED_ERROR
    );
  }
};

export const processApiResponse = (data) => {
  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items
    .map(mapBookItem)
    .filter((book) => book.imagePath && book.description);
};
