import HttpError from '../../../models/httpErrorModel.js';
import {
  validateSearchParams,
  validateGoogleQuery,
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
    validateGoogleQuery(googleQuery);
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
    return await executeQuery(searchQuery);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      'Error performing general search in database',
      500,
      'GENERAL_SEARCH_ERROR',
      { query }
    );
  }
}