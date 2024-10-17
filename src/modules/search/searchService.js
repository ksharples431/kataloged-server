import { HttpStatusCodes } from '../../errors/errorCategories.js';
import {
  buildQuery,
  executeQuery,
  buildRequestConfig,
  fetchBooksFromGoogleAPI,
  processApiResponse,
} from './searchHelpers.js';

export async function searchBooksInDatabase(searchParams, requestId) {
  try {
    const query = buildQuery(searchParams);
    const results = await executeQuery(query, requestId);
    return results;
  } catch (error) {
    const dbError = new Error('Error searching books in database');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { searchParams, requestId, message: error.message };
    throw dbError;
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
    const apiError = new Error('Error searching books in Google API');
    apiError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    apiError.details = {
      googleQuery,
      maxResults,
      requestId,
      message: error.message,
    };
    throw apiError;
  }
};

export async function searchDatabaseGeneral(query, requestId) {
  try {
    const searchQuery = buildQuery(query);
    const results = await executeQuery(searchQuery, requestId);
    return results;
  } catch (error) {
    const dbError = new Error(
      'Error performing general search in database'
    );
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { query, requestId, message: error.message };
    throw dbError;
  }
}

export async function searchUserBooksByBids(uid, bids, requestId) {
  try {
    const allUserBooks = await fetchUserBooks(uid, requestId);
    return allUserBooks.filter((userBook) => bids.includes(userBook.bid));
  } catch (error) {
    const dbError = new Error('Error searching user books by BIDs');
    dbError.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    dbError.details = { uid, bids, requestId, message: error.message };
    throw dbError;
  }
}
