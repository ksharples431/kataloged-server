import HttpError from '../../../models/httpErrorModel.js';
import db from '../../../config/firebaseConfig.js';
import {
  validateSearchParams,
  validateGeneralSearchParams,
} from '../helpers/validationHelpers.js';
import {
  buildQuery,
  executeQuery,
  buildGeneralSearchQuery,
  buildRequestConfig,
  fetchBooksFromGoogleAPI,
  processApiResponse,
} from '../helpers/searchHelpers.js';

import { fetchUserBooks } from '../../userBooks/services/userBookService.js';
import { combineBooksData } from '../../userBooks/services/combineBooksService.js';
import { formatUserBookDetailsResponse } from '../../userBooks/helpers/utilityHelpers.js';

export async function searchBooksInDatabase(searchParams) {
  try {
    validateSearchParams(searchParams);
    const query = buildQuery(searchParams);
    return await executeQuery(query);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error searching books in database',
      500,
      'DATABASE_SEARCH_ERROR',
      { searchParams }
    );
  }
}

export const searchBooksInGoogleAPI = async (
  googleQuery,
  maxResults = 20
) => {
  try {
    const config = buildRequestConfig(googleQuery, maxResults);
    const data = await fetchBooksFromGoogleAPI(config);
    return processApiResponse(data);
  } catch (error) {
    console.error('Error in Google Books API search:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error searching books in Google API',
      500,
      'GOOGLE_API_SEARCH_ERROR',
      { googleQuery, maxResults, originalError: error.message }
    );
  }
};

export async function searchDatabaseGeneral(query) {
  try {
    validateGeneralSearchParams(query);
    const searchQuery = buildGeneralSearchQuery(query);
    const results = await executeQuery(searchQuery);
    return results;
  } catch (error) {
    console.error('Error in searchDatabaseGeneral:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error performing general search in database',
      500,
      'GENERAL_SEARCH_ERROR',
      { query, error: error.message }
    );
  }
}

export async function searchUserBooksByBids(uid, bids) {
  try {
    // Fetch all user books
    const allUserBooks = await fetchUserBooks(uid);

    // Filter user books based on the bids from search results
    const matchedUserBooks = allUserBooks.filter((userBook) =>
      bids.includes(userBook.bid)
    );

    console.log(
      `Found ${matchedUserBooks.length} matching user books out of ${allUserBooks.length} total user books for uid: ${uid}`
    );

    return matchedUserBooks;
  } catch (error) {
    console.error('Error searching user books by bids:', error);
    throw new HttpError(
      'Error searching user books',
      500,
      'USER_BOOKS_SEARCH_ERROR',
      { uid, bids, error: error.message }
    );
  }
}