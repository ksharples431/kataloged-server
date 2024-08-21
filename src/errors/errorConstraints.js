// HTTP Status Codes
export const HttpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// Error Categories
export const ErrorCategories = {
  CLIENT_ERROR: {
    VALIDATION: 'ClientError.ValidationError',
    AUTHENTICATION: 'ClientError.AuthenticationError',
    AUTHORIZATION: 'ClientError.AuthorizationError',
    NOT_FOUND: 'ClientError.NotFoundError',
    CONFLICT: 'ClientError.ConflictError',
    RATE_LIMIT: 'ClientError.RateLimitError',
    BAD_REQUEST: 'ClientError.BadRequestError',
  },
  SERVER_ERROR: {
    INTERNAL: 'ServerError.InternalError',
    SERVICE_UNAVAILABLE: 'ServerError.ServiceUnavailable',
    DATABASE: 'ServerError.DatabaseError',
    EXTERNAL_API: 'ServerError.ExternalAPIError',
    UNKNOWN: 'ServerError.UnknownError',
  },
};

// Specific Error Codes
export const ErrorCodes = {
  // Validation Errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Authentication Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // Authorization Errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PRIVILEGES: 'INSUFFICIENT_PRIVILEGES',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Database Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  CONNECTION_ERROR: 'CONNECTION_ERROR',

  // External API Errors
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RESPONSE_ERROR: 'API_RESPONSE_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',

  // Firebase Specific Errors
  FIREBASE_AUTH_ERROR: 'FIREBASE_AUTH_ERROR',
  FIREBASE_DATABASE_ERROR: 'FIREBASE_DATABASE_ERROR',
  FIREBASE_STORAGE_ERROR: 'FIREBASE_STORAGE_ERROR',

  // gRPC Specific Errors
  GRPC_ERROR: 'GRPC_ERROR',

  // General Server Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
};

// Map HTTP status codes to error categories
export const statusCodeToCategory = {
  [HttpStatusCodes.BAD_REQUEST]: ErrorCategories.CLIENT_ERROR.VALIDATION,
  [HttpStatusCodes.FORBIDDEN]: ErrorCategories.CLIENT_ERROR.AUTHORIZATION,
  [HttpStatusCodes.NOT_FOUND]: ErrorCategories.CLIENT_ERROR.NOT_FOUND,
  [HttpStatusCodes.CONFLICT]: ErrorCategories.CLIENT_ERROR.CONFLICT,
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]:
    ErrorCategories.SERVER_ERROR.INTERNAL,
  [HttpStatusCodes.TOO_MANY_REQUESTS]:
    ErrorCategories.CLIENT_ERROR.RATE_LIMIT,
  [HttpStatusCodes.UNAUTHORIZED]:
    ErrorCategories.CLIENT_ERROR.AUTHENTICATION,
  [HttpStatusCodes.SERVICE_UNAVAILABLE]:
    ErrorCategories.SERVER_ERROR.SERVICE_UNAVAILABLE,
};

// Helper function to get error category from status code
export const getErrorCategory = (statusCode) => {
  return (
    statusCodeToCategory[statusCode] ||
    ErrorCategories.SERVER_ERROR.UNKNOWN
  );
};
