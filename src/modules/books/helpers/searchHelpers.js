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
    throw new HttpError(
      'Error searching books in database',
      500,
      'DATABASE_QUERY_ERROR',
      { query: query.toString() }
    );
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
  throw new HttpError(
    'Invalid search parameters',
    400,
    'INVALID_SEARCH_PARAMS',
    { title, author, isbn }
  );
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
        error.response?.status || 500,
        'GOOGLE_API_ERROR',
        { message: error.message }
      );
    }
    throw new HttpError(
      'Unknown error occurred while fetching books from Google API',
      500,
      'UNKNOWN_GOOGLE_API_ERROR'
    );
  }
};

export const processApiResponse = (data) => {
  if (!data.items || data.items.length === 0) {
    return [];
  }

  try {
    return data.items
      .map(mapBookItem)
      .filter((book) => book.imagePath && book.description);
  } catch (error) {
    throw new HttpError(
      'Error processing API response',
      500,
      'API_RESPONSE_PROCESSING_ERROR',
      { data }
    );
  }
};

export const buildGeneralSearchQuery = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return bookCollection
    .where('lowercaseTitle', '>=', lowercaseQuery)
    .where('lowercaseTitle', '<=', lowercaseQuery + '\uf8ff')
    .limit(10)
    .get()
    .then(async (titleSnapshot) => {
      let results = titleSnapshot.docs.map((doc) => doc.data());

      const authorSnapshot = await bookCollection
        .where('lowercaseAuthor', '>=', lowercaseQuery)
        .where('lowercaseAuthor', '<=', lowercaseQuery + '\uf8ff')
        .limit(10)
        .get();

      results = results.concat(
        authorSnapshot.docs.map((doc) => doc.data())
      );

      // Remove duplicates (in case a book matches both by title and author)
      return Array.from(new Set(results.map(JSON.stringify))).map(
        JSON.parse
      );
    });
};
