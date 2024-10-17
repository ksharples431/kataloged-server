import { HttpStatusCodes } from './errorCategories'; // Using HttpStatusCodes directly

// Map Firebase Auth Errors to HTTP Status Codes (Keep only if necessary)
export const firebaseAuthToHttpStatus = {
  'auth/id-token-expired': HttpStatusCodes.UNAUTHORIZED,
  'auth/user-not-found': HttpStatusCodes.FORBIDDEN,
};

// Simplified error handling for Axios
export function mapAxiosErrorToCustomError(
  err,
  apiName = 'API',
  req = {}
) {
  const statusCode =
    err?.response?.status || HttpStatusCodes.INTERNAL_SERVER_ERROR;
  const errorMessage =
    err?.response?.data?.message || err.message || 'API Error';

  return {
    message: `${apiName} Error: ${errorMessage}`,
    statusCode,
    requestId: req.id,
  };
}
