import axios from 'axios';
import db from '../../config/firebaseConfig.js';
import { HttpStatusCodes } from '../../errors/errorCategories.js';
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
  const error = new Error('Invalid search parameters');
  error.statusCode = HttpStatusCodes.BAD_REQUEST;
  throw error;
};

export const executeQuery = async (query, requestId) => {
  try {
    if (query instanceof Promise) {
      const snapshot = await query;
      return snapshot;
    } else {
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => doc.data());
    }
  } catch (error) {
    const dbError = new Error('Error executing database query');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { requestId, error: error.message };
    throw dbError;
  }
};

export const buildRequestConfig = (googleQuery) => ({
  params: {
    q: googleQuery,
    key: process.env.GOOGLE_BOOKS_API_KEY,
    maxResults: MAX_RESULTS,
  },
  headers: {
    Referer: process.env.APP_URL_PROD || process.env.APP_URL_LOCAL,
  },
});

export const fetchBooksFromGoogleAPI = async (config, requestId) => {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, config);
    return response.data;
  } catch (error) {
    const apiError = new Error('Google Books API Error');
    apiError.statusCode =
      error.response?.status || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    apiError.details = { requestId, message: error.message };
    throw apiError;
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

export const mapBookItem = (item, requestId) => {
  if (!item || !item.volumeInfo) {
    const error = new Error('Invalid book item');
    error.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    throw error;
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
