import HttpError from '../../errors/httpErrorModel.js';

import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../errors/errorConstraints.js';
import {
  buildQuery,
  executeQuery,
  buildGeneralSearchQuery,
  buildRequestConfig,
  fetchBooksFromGoogleAPI,
  processApiResponse,
} from './searchHelpers.js';
import { fetchUserBooks } from '../userBooks/services/userBookService.js';

export async function searchBooksInDatabase(searchParams) {
  try {
    const query = buildQuery(searchParams);
    const results = await executeQuery(query);

 

    return results;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error searching books in database',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { searchParams, error: error.message }
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
    const results = processApiResponse(data);



    return results;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error searching books in Google API',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.API_REQUEST_FAILED,
      { googleQuery, maxResults, error: error.message }
    );
  }
};

export async function searchDatabaseGeneral(query) {
  try {
    const searchQuery = buildGeneralSearchQuery(query);
    const results = await executeQuery(searchQuery);



    return results;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error performing general search in database',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { query, error: error.message }
    );
  }
}

export async function searchUserBooksByBids(uid, bids) {
  try {
    const allUserBooks = await fetchUserBooks(uid);
    const matchedUserBooks = allUserBooks.filter((userBook) =>
      bids.includes(userBook.bid)
    );

    return matchedUserBooks;
  } catch (error) {
    throw new HttpError(
      'Error searching user books by BIDs',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      { uid, bids, error: error.message }
    );
  }
}
