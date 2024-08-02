import { validateSearchParams, validateGoogleQuery } from '../helpers/validationHelpers.js';
import { buildQuery, executeQuery, buildRequestConfig, fetchBooksFromGoogleAPI } from '../helpers/searchHelpers.js';

export async function searchBooksInDatabase(searchParams) {
  validateSearchParams(searchParams);
  const query = buildQuery(searchParams);
  return executeQuery(query);
}

export const searchBooksInGoogleAPI = async (
  googleQuery,
  maxResults = 20
) => {
  validateGoogleQuery(googleQuery);

  const config = buildRequestConfig(googleQuery, maxResults);
  const data = await fetchBooksFromGoogleAPI(config);

  return processApiResponse(data);
};