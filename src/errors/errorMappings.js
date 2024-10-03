// ============================================
// Error Mappings and Handlers
// ============================================

import { createCustomError, createUnknownError } from './customError.js';

// Consolidated Definitions and Mappings
export const HttpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FIREBASE_AUTH_ERROR: 'FIREBASE_AUTH_ERROR',
};

export const ErrorCategories = {
  CLIENT_ERROR: 'ClientError',
  SERVER_ERROR: 'ServerError',
};

// Unified Function for Error Mapping
export const mapServiceErrorToCustomError = (err, service, req = {}) => {
  if (!err) return createUnknownError(err, req);

  let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
  let errorCode = ErrorCodes.UNKNOWN_ERROR;
  let category = ErrorCategories.SERVER_ERROR;

  switch (service) {
    case 'gRPC':
      statusCode = grpcToHttpStatus[err.code] || statusCode;
      errorCode = grpcToErrorCode[err.code] || errorCode;
      break;
    case 'Firebase':
      statusCode = firebaseAuthToHttpStatus[err.code] || statusCode;
      errorCode = firebaseAuthToErrorCode[err.code] || errorCode;
      category = ErrorCategories.CLIENT_ERROR;
      break;
    case 'Axios':
      statusCode =
        err.response?.status || HttpStatusCodes.SERVICE_UNAVAILABLE;
      errorCode = ErrorCodes.API_TIMEOUT;
      break;
    default:
      statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
  }

  return createCustomError(
    err?.message || `${service} Error`,
    statusCode,
    errorCode,
    { originalError: err, service, requestId: req.id },
    { stack: err?.stack, category }
  );
};

// General Error Mapping
export const mapErrorToCustomError = (err, req = {}) => {
  if (!err) return createUnknownError(err, req);

  if (err.isJoi || err.name === 'ValidationError') {
    return createCustomError(
      err.message || 'Validation Error',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { originalError: err, requestId: req.id },
      { stack: err.stack, category: ErrorCategories.CLIENT_ERROR }
    );
  }

  switch (err.name) {
    case 'FirebaseAuthError':
    case 'FirebaseError':
      return mapServiceErrorToCustomError(err, 'Firebase', req);
    case 'AxiosError':
      return mapServiceErrorToCustomError(err, 'Axios', req);
    case 'gRPCError':
      return mapServiceErrorToCustomError(err, 'gRPC', req);
    default:
      return createUnknownError(err, req);
  }
};
