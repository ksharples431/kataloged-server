// HTTP Status Codes
export const HttpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Specific Error Codes (If you want to keep a few custom ones for logging purposes)
export const ErrorCodes = {
  FIREBASE_AUTH_ERROR: 'FIREBASE_AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR', // Just a few key ones to keep
};
