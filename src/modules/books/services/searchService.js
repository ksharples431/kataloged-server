import HttpError from '../../../errors/httpErrorModel.js';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../../../errors/errorConstraints.js';
import {
  buildQuery,
  executeQuery,
  buildGeneralSearchQuery,
  buildRequestConfig,
  fetchBooksFromGoogleAPI,
  processApiResponse,
  validateSearchParams,
  validateGeneralSearchParams,
} from '../bookHelpers.js';
import { fetchUserBooks } from '../../userBooks/services/userBookService.js';
import { logEntry } from '../../../config/cloudLoggingConfig.js';

export async function searchBooksInDatabase(searchParams) {
  try {
    validateSearchParams(searchParams);
    const query = buildQuery(searchParams);
    const results = await executeQuery(query);

    await logEntry({
      message: `Database search performed`,
      severity: 'INFO',
      searchParams,
      resultsCount: results.length,
    });

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

    await logEntry({
      message: `Google Books API search performed`,
      severity: 'INFO',
      googleQuery,
      maxResults,
      resultsCount: results.length,
    });

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
    validateGeneralSearchParams(query);
    const searchQuery = buildGeneralSearchQuery(query);
    const results = await executeQuery(searchQuery);

    await logEntry({
      message: `General database search performed`,
      severity: 'INFO',
      query,
      resultsCount: results.length,
    });

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

    await logEntry({
      message: `User books search by BIDs performed`,
      severity: 'INFO',
      uid,
      totalUserBooks: allUserBooks.length,
      matchedUserBooks: matchedUserBooks.length,
    });

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
