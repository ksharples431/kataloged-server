import axios from 'axios';
import db from '../../config/firebaseConfig.js';
import HttpError from '../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import { generateId, findISBN13 } from '../../utils/globalHelpers.js';

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
    try {
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
    } catch (error) {
      reject(
        new HttpError(
          'Error building general search query',
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          ErrorCodes.DATABASE_ERROR,
          { query, error: error.message }
        )
      );
    }
  });
};

export const executeQuery = async (query) => {
  try {
    if (query instanceof Promise) {
      // If query is a Promise (as in the case of buildGeneralSearchQuery), await it
      const snapshot = await query;
      return snapshot;
    } else {
      // If query is a Firestore Query object, execute get() and return the result
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => doc.data());
    }
  } catch (error) {
    throw new HttpError(
      'Error executing database query',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { error: error.message }
    );
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
      ErrorCodes.UNEXPECTED_ERROR,
      { error: error.message }
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

// Mapping Helpers
export const mapBookItem = (item) => {
  if (!item || !item.volumeInfo) {
    throw new HttpError(
      'Invalid book item',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INVALID_INPUT,
      { title: item.volumeInfo.title }
    );
  }

  return {
    bid: generateId(item),
    title: item.volumeInfo.title || 'Unknown Title',
    author: item.volumeInfo.authors?.[0] || 'Unknown Author',
    description: item.volumeInfo.description || '',
    genre: item.volumeInfo.categories?.[0] || 'Uncategorized',
    imagePath: item.volumeInfo.imageLinks?.thumbnail,
    isbn: findISBN13(item.volumeInfo.industryIdentifiers),
    lowercaseTitle: (
      item.volumeInfo.title || 'Unknown Title'
    ).toLowerCase(),
    lowercaseAuthor: (
      item.volumeInfo.authors?.[0] || 'Unknown Author'
    ).toLowerCase(),
  };
};