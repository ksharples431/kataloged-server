import db from '../../../config/firebaseConfig.js';
import axios from 'axios';
import HttpError from '../../../models/httpErrorModel.js';
import { mapBookItem } from '../helpers/mappingHelpers.js';

const bookCollection = db.collection('books');
const GOOGLE_BOOKS_API_URL = process.env.GOOGLE_BOOKS_API_URL;
const MAX_RESULTS = 20;

export const buildQueryForISBN = (query, isbn) => {
  return query.where('isbn', '==', isbn);
};

export const buildQueryForTitleAndAuthor = (query, title, author) => {
  const titleLower = title.toLowerCase();
  const authorLower = author.toLowerCase();
  return query
    .where('lowercaseTitle', '>=', titleLower)
    .where('lowercaseTitle', '<', titleLower + '\uf8ff')
    .where('lowercaseAuthor', '>=', authorLower)
    .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
};

export const buildQueryForTitle = (query, title) => {
  const titleLower = title.toLowerCase();
  return query
    .where('lowercaseTitle', '>=', titleLower)
    .where('lowercaseTitle', '<', titleLower + '\uf8ff');
};

export const buildQueryForAuthor = (query, author) => {
  const authorLower = author.toLowerCase();
  return query
    .where('lowercaseAuthor', '>=', authorLower)
    .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
};

export const buildQuery = (searchParams) => {
  let query = bookCollection;

  if (searchParams.isbn) {
    return buildQueryForISBN(query, searchParams.isbn);
  } else if (searchParams.title && searchParams.author) {
    return buildQueryForTitleAndAuthor(
      query,
      searchParams.title,
      searchParams.author
    );
  } else if (searchParams.title) {
    return buildQueryForTitle(query, searchParams.title);
  } else if (searchParams.author) {
    return buildQueryForAuthor(query, searchParams.author);
  }

  return query;
};

export const executeQuery = async (query) => {
  try {
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Error searching books in database:', error);
    throw new HttpError('Error searching books in database', 500);
  }
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
  return '';
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
    console.error('Google Books API Error:', error.message);
    throw error; 
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