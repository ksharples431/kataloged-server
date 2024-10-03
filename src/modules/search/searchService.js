import { createCustomError } from '../../errors/customError.js';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../../errors/errorMappings.js';
import {
  buildQuery,
  executeQuery,
  buildGeneralSearchQuery,
  buildRequestConfig,
  fetchBooksFromGoogleAPI,
  processApiResponse,
} from './searchHelpers.js';
import { fetchUserBooks } from '../userBooks/userBookService.js';

export async function searchBooksInDatabase(searchParams, requestId) {
  try {
    const query = buildQuery(searchParams);
    const results = await executeQuery(query, requestId);
    return results;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error searching books in database',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { searchParams, error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
}

export const searchBooksInGoogleAPI = async (
  googleQuery,
  maxResults = 20,
  requestId
) => {
  try {
    const config = buildRequestConfig(googleQuery, maxResults);
    const data = await fetchBooksFromGoogleAPI(config, requestId);
    const results = processApiResponse(data, requestId);
    return results;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error searching books in Google API',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.API_REQUEST_FAILED,
      { googleQuery, maxResults, error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.EXTERNAL_API }
    );
  }
};

export async function searchDatabaseGeneral(query, requestId) {
  try {
    const searchQuery = buildGeneralSearchQuery(query, requestId);
    const results = await executeQuery(searchQuery, requestId);
    return results;
  } catch (error) {
    if (error.name === 'CustomError') throw error;
    throw createCustomError(
      'Error performing general search in database',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { query, error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
}

export async function searchUserBooksByBids(uid, bids, requestId) {
  try {
    const allUserBooks = await fetchUserBooks(uid, requestId);
    const matchedUserBooks = allUserBooks.filter((userBook) =>
      bids.includes(userBook.bid)
    );
    return matchedUserBooks;
  } catch (error) {
    throw createCustomError(
      'Error searching user books by BIDs',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, bids, error: error.message, requestId },
      { category: ErrorCategories.SERVER_ERROR.DATABASE }
    );
  }
}
