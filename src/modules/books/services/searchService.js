import axios from 'axios';
import db from '../../../config/firebaseConfig.js';
import HttpError from '../../../models/httpErrorModel.js';
import { mapBookItem } from '../helpers/mappingHelpers.js';

const bookCollection = db.collection('books');

export async function searchBooksInDatabase(searchParams) {
  if (!searchParams.isbn && !searchParams.title && !searchParams.author) {
    throw new HttpError('At least one search parameter is required', 400);
  }

  let query = bookCollection;

  if (searchParams.isbn) {
    query = query.where('isbn', '==', searchParams.isbn);
  } else {
    if (searchParams.title && searchParams.author) {
      const titleLower = searchParams.title.toLowerCase();
      const authorLower = searchParams.author.toLowerCase();
      query = query
        .where('lowercaseTitle', '>=', titleLower)
        .where('lowercaseTitle', '<', titleLower + '\uf8ff')
        .where('lowercaseAuthor', '>=', authorLower)
        .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
    } else if (searchParams.title) {
      const titleLower = searchParams.title.toLowerCase();
      query = query
        .where('lowercaseTitle', '>=', titleLower)
        .where('lowercaseTitle', '<', titleLower + '\uf8ff');
    } else if (searchParams.author) {
      const authorLower = searchParams.author.toLowerCase();
      query = query
        .where('lowercaseAuthor', '>=', authorLower)
        .where('lowercaseAuthor', '<', authorLower + '\uf8ff');
    }
  }

  try {
    const snapshot = await query.get();
    let books = snapshot.docs.map((doc) => doc.data());

    return books;
  } catch (error) {
    console.error('Error searching books in database:', error);
    throw new HttpError('Error searching books in database', 500);
  }
}

export const searchBooksInGoogleAPI = async (googleQuery) => {
  const GOOGLE_BOOKS_API_URL =
    'https://www.googleapis.com/books/v1/volumes';

  if (!googleQuery) {
    throw new HttpError('Invalid search criteria', 400);
  }

  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: googleQuery,
        key: process.env.GOOGLE_BOOKS_API_KEY,
      },
      headers: {
        Referer: process.env.APP_URL_PROD || process.env.APP_URL_LOCAL,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    return response.data.items
      .map(mapBookItem)
      .filter((book) => book.imagePath && book.description);
  } catch (error) {
    console.error(
      'Google Books API Error:',
      error.response?.data || error.message
    );
    throw new HttpError('Unable to fetch books from external API', 503);
  }
};
