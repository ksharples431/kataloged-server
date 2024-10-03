
// ============================================
// Consolidated Error Mappings and Handlers
// ============================================

// Error Code and Category Definitions
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
  BAD_GATEWAY: 502,
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
    CODING_ERROR: 'ServerError.CodingError',
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

  // Google Books API Specific Errors
  GOOGLE_BOOKS_API_ERROR: 'GOOGLE_BOOKS_API_ERROR',

  // gRPC Specific Errors
  GRPC_ERROR: 'GRPC_ERROR',

  // General Server Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',

  // Coding Error Codes
  CODING_TYPE_ERROR: 'CODING_TYPE_ERROR',
  CODING_REFERENCE_ERROR: 'CODING_REFERENCE_ERROR',
  CODING_SYNTAX_ERROR: 'CODING_SYNTAX_ERROR',

  // Firebase Firestore Specific Errors
  FIRESTORE_PERMISSION_DENIED: 'FIRESTORE_PERMISSION_DENIED',
  FIRESTORE_NOT_FOUND: 'FIRESTORE_NOT_FOUND',
  FIRESTORE_ALREADY_EXISTS: 'FIRESTORE_ALREADY_EXISTS',
  FIRESTORE_FAILED_PRECONDITION: 'FIRESTORE_FAILED_PRECONDITION',
  FIRESTORE_ABORTED: 'FIRESTORE_ABORTED',
  FIRESTORE_UNAVAILABLE: 'FIRESTORE_UNAVAILABLE',
};

// Map HTTP status codes to error categories
export const statusCodeToCategory = {
  [HttpStatusCodes.BAD_REQUEST]: ErrorCategories.CLIENT_ERROR.VALIDATION,
  [HttpStatusCodes.UNAUTHORIZED]: ErrorCategories.CLIENT_ERROR.AUTHENTICATION,
  [HttpStatusCodes.FORBIDDEN]: ErrorCategories.CLIENT_ERROR.AUTHORIZATION,
  [HttpStatusCodes.NOT_FOUND]: ErrorCategories.CLIENT_ERROR.NOT_FOUND,
  [HttpStatusCodes.CONFLICT]: ErrorCategories.CLIENT_ERROR.CONFLICT,
  [HttpStatusCodes.TOO_MANY_REQUESTS]: ErrorCategories.CLIENT_ERROR.RATE_LIMIT,
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: ErrorCategories.SERVER_ERROR.INTERNAL,
  [HttpStatusCodes.SERVICE_UNAVAILABLE]: ErrorCategories.SERVER_ERROR.SERVICE_UNAVAILABLE,
  [HttpStatusCodes.BAD_GATEWAY]: ErrorCategories.SERVER_ERROR.EXTERNAL_API,
};

// Helper function to get error category from status code
export const getErrorCategory = (statusCode) => {
  return statusCodeToCategory[statusCode] || ErrorCategories.SERVER_ERROR.UNKNOWN;
};

// gRPC status to HTTP status mapping
export const grpcToHttpStatus = {
  0: HttpStatusCodes.OK, // OK
  1: HttpStatusCodes.CANCELLED, // CANCELLED
  2: HttpStatusCodes.INTERNAL_SERVER_ERROR, // UNKNOWN
  3: HttpStatusCodes.BAD_REQUEST, // INVALID_ARGUMENT
  4: HttpStatusCodes.GATEWAY_TIMEOUT, // DEADLINE_EXCEEDED
  5: HttpStatusCodes.NOT_FOUND, // NOT_FOUND
  6: HttpStatusCodes.CONFLICT, // ALREADY_EXISTS
  7: HttpStatusCodes.FORBIDDEN, // PERMISSION_DENIED
  8: HttpStatusCodes.UNAUTHORIZED, // UNAUTHENTICATED
  9: HttpStatusCodes.TOO_MANY_REQUESTS, // RESOURCE_EXHAUSTED
  10: HttpStatusCodes.BAD_REQUEST, // FAILED_PRECONDITION
  11: HttpStatusCodes.CONFLICT, // ABORTED
  12: HttpStatusCodes.BAD_REQUEST, // OUT_OF_RANGE
  13: HttpStatusCodes.NOT_IMPLEMENTED, // UNIMPLEMENTED
  14: HttpStatusCodes.INTERNAL_SERVER_ERROR, // INTERNAL
  15: HttpStatusCodes.SERVICE_UNAVAILABLE, // UNAVAILABLE
  16: HttpStatusCodes.INTERNAL_SERVER_ERROR, // DATA_LOSS
};

// gRPC status to error code mapping
export const grpcToErrorCode = {
  0: ErrorCodes.SUCCESS,
  1: ErrorCodes.REQUEST_CANCELLED,
  2: ErrorCodes.UNKNOWN_ERROR,
  3: ErrorCodes.INVALID_INPUT,
  4: ErrorCodes.API_TIMEOUT,
  5: ErrorCodes.RESOURCE_NOT_FOUND,
  6: ErrorCodes.RESOURCE_ALREADY_EXISTS,
  7: ErrorCodes.PERMISSION_DENIED,
  8: ErrorCodes.INVALID_CREDENTIALS,
  9: ErrorCodes.RATE_LIMIT_EXCEEDED,
  10: ErrorCodes.INVALID_INPUT,
  11: ErrorCodes.CONFLICT,
  12: ErrorCodes.INVALID_INPUT,
  13: ErrorCodes.NOT_IMPLEMENTED,
  14: ErrorCodes.INTERNAL_SERVER_ERROR,
  15: ErrorCodes.SERVICE_UNAVAILABLE,
  16: ErrorCodes.DATA_LOSS,
};

// Firebase auth error to error code mapping
export const firebaseAuthToErrorCode = {
  'auth/id-token-expired': ErrorCodes.TOKEN_EXPIRED,
  'auth/id-token-revoked': ErrorCodes.TOKEN_INVALID,
  'auth/invalid-id-token': ErrorCodes.TOKEN_INVALID,
  'auth/user-disabled': ErrorCodes.USER_NOT_FOUND,
  'auth/user-not-found': ErrorCodes.USER_NOT_FOUND,
};

// Firebase Firestore error to error code mapping
export const firestoreToErrorCode = {
  'permission-denied': ErrorCodes.PERMISSION_DENIED,
  'not-found': ErrorCodes.RESOURCE_NOT_FOUND,
  'already-exists': ErrorCodes.RESOURCE_ALREADY_EXISTS,
  'failed-precondition': ErrorCodes.INVALID_INPUT,
  'aborted': ErrorCodes.DATABASE_ERROR,
  'cancelled': ErrorCodes.DATABASE_ERROR,
  'deadline-exceeded': ErrorCodes.DATABASE_ERROR,
  'unavailable': ErrorCodes.SERVICE_UNAVAILABLE,
};

// Firebase auth error to HTTP status code mapping
export const firebaseAuthToHttpStatus = {
  'auth/id-token-expired': HttpStatusCodes.UNAUTHORIZED,
  'auth/id-token-revoked': HttpStatusCodes.UNAUTHORIZED,
  'auth/invalid-id-token': HttpStatusCodes.UNAUTHORIZED,
  'auth/user-disabled': HttpStatusCodes.FORBIDDEN,
  'auth/user-not-found': HttpStatusCodes.FORBIDDEN,
};

// Firebase Firestore error to HTTP status code mapping
export const firestoreToHttpStatus = {
  'permission-denied': HttpStatusCodes.FORBIDDEN,
  'not-found': HttpStatusCodes.NOT_FOUND,
  'already-exists': HttpStatusCodes.CONFLICT,
  'failed-precondition': HttpStatusCodes.BAD_REQUEST,
  'invalid-argument': HttpStatusCodes.BAD_REQUEST,
  'unavailable': HttpStatusCodes.SERVICE_UNAVAILABLE,
};

// Error Mapping Functions
import {
  HttpStatusCodes,
  ErrorCodes,
  ErrorCategories,
  grpcToHttpStatus,
  grpcToErrorCode,
  firebaseAuthToErrorCode,
  firestoreToErrorCode,
  firebaseAuthToHttpStatus,
  firestoreToHttpStatus,
  getErrorCategory,
} from './errorConstraints.js';
import { createCustomError, createUnknownError } from './customError.js';

////////////////////////////////////////////
// gRPC Error Handling /////////////////////
////////////////////////////////////////////

// Map gRPC errors to custom errors
export const mapGrpcErrorToCustomError = (err, req = {}) => {
  if (!err) return createUnknownError(err, req);
  const statusCode =
    grpcToHttpStatus[err.code] || HttpStatusCodes.INTERNAL_SERVER_ERROR;
  const errorCode = grpcToErrorCode[err.code] || ErrorCodes.GRPC_ERROR;
  const category = getErrorCategory(statusCode);

  return createCustomError(
    err?.message || 'gRPC Error',
    statusCode,
    errorCode,
    { originalError: err, requestId: req.id },
    { stack: err?.stack, category }
  );
};

////////////////////////////////////////////
// Axios Error Handling ////////////////////
////////////////////////////////////////////

// Map Axios errors to custom errors, including for Google Books API
export const mapAxiosErrorToCustomError = (
  err,
  apiName = 'API',
  req = {}
) => {
  if (!err) return createUnknownError(err, req);
  const method = err?.config?.method;
  const url = err?.config?.url;

  if (err?.response) {
    const statusCode = err.response.status;
    const errorMessage =
      err.response.data?.error?.message ||
      err.response.data?.message ||
      err.message;
    const errorCode = ErrorCodes.API_RESPONSE_ERROR;
    const category = getErrorCategory(statusCode);

    return createCustomError(
      `${apiName} Error: ${errorMessage} (Request: ${method?.toUpperCase()} ${url})`,
      statusCode,
      errorCode,
      {
        originalError: err,
        apiName,
        responseData: err.response.data,
        requestId: req.id,
      },
      { stack: err?.stack, category }
    );
  } else if (err?.request) {
    return createCustomError(
      `No response received from ${apiName} (Request: ${method?.toUpperCase()} ${url})`,
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      ErrorCodes.API_TIMEOUT,
      { originalError: err, apiName, requestId: req.id },
      {
        stack: err?.stack,
        category: ErrorCategories.SERVER_ERROR.EXTERNAL_API,
      }
    );
  } else {
    return createCustomError(
      `Error setting up the request to ${apiName}: ${err?.message}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.API_REQUEST_FAILED,
      { originalError: err, apiName, requestId: req.id },
      {
        stack: err?.stack,
        category: ErrorCategories.SERVER_ERROR.EXTERNAL_API,
      }
    );
  }
};

////////////////////////////////////////////
// Firebase Error Handling /////////////////
////////////////////////////////////////////

// Map Firebase Auth errors to custom errors
export const mapFirebaseAuthErrorToCustomError = (err, req = {}) => {
  if (!err) return createUnknownError(err, req);

  // If it's already a CustomError, return it as is
  if (err.name === 'CustomError') {
    return err;
  }

  const errorCode =
    firebaseAuthToErrorCode[err.code] || ErrorCodes.FIREBASE_AUTH_ERROR;
  const statusCode =
    firebaseAuthToHttpStatus[err.code] || HttpStatusCodes.UNAUTHORIZED;
  const category = ErrorCategories.CLIENT_ERROR.AUTHENTICATION;

  return createCustomError(
    err?.message || 'Firebase Authentication Error',
    statusCode,
    errorCode,
    { originalError: err, requestId: req.id },
    { stack: err?.stack, category }
  );
};

// Map Firebase Firestore errors to custom errors
export const mapFirestoreErrorToCustomError = (err, req = {}) => {
  if (!err) return createUnknownError(err, req);

  // Check for permission denied error first
  if (err.code === 'permission-denied') {
    return createCustomError(
      'Permission denied to access Firestore',
      HttpStatusCodes.FORBIDDEN,
      ErrorCodes.PERMISSION_DENIED,
      { originalError: err, requestId: req.id },
      {
        stack: err.stack,
        category: ErrorCategories.CLIENT_ERROR.AUTHORIZATION,
      }
    );
  }

  // Handle validation errors
  if (
    err.code === 'failed-precondition' ||
    err.code === 'invalid-argument'
  ) {
    return createCustomError(
      err.message || 'Firestore Validation Error',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT,
      { originalError: err, requestId: req.id },
      {
        stack: err.stack,
        category: ErrorCategories.CLIENT_ERROR.VALIDATION,
      }
    );
  }

  // Handle other Firestore errors
  const errorCode =
    firestoreToErrorCode[err.code] || ErrorCodes.FIREBASE_DATABASE_ERROR;
  const statusCode =
    firestoreToHttpStatus[err.code] ||
    HttpStatusCodes.INTERNAL_SERVER_ERROR;
  const category = getErrorCategory(statusCode);

  return createCustomError(
    err.message || 'Firestore Error',
    statusCode,
    errorCode,
    { originalError: err, requestId: req.id },
    { stack: err.stack, category }
  );
};

// Map general Firebase errors to custom errors
export const mapFirebaseErrorToCustomError = (err, req = {}) => {
  if (!err) return createUnknownError(err, req);

  if (err.name === 'FirebaseAuthError') {
    return mapFirebaseAuthErrorToCustomError(err, req);
  } else if (
    err.name === 'FirebaseError' &&
    err.code?.startsWith('firestore/')
  ) {
    return mapFirestoreErrorToCustomError(err, req);
  } else {
    return createCustomError(
      err?.message || 'Firebase Error',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.FIREBASE_DATABASE_ERROR,
      { originalError: err, requestId: req.id },
      {
        stack: err?.stack,
        category: ErrorCategories.SERVER_ERROR.DATABASE,
      }
    );
  }
};

////////////////////////////////////////////
// General Error Handling //////////////////
////////////////////////////////////////////

// Main error mapping function
export const mapErrorToCustomError = (err, req = {}) => {
  if (!err) return createUnknownError(err, req);

  if (err.isJoi) {
    return mapValidationErrorToCustomError(err, req);
  }

  switch (err.name) {
    case 'ValidationError':
      return mapValidationErrorToCustomError(err, req);
    case 'FirebaseAuthError':
    case 'FirebaseError':
      return mapFirebaseErrorToCustomError(err, req);
    case 'AxiosError':
      const apiName = err.config?.url?.includes('googleapis.com/books')
        ? 'Google Books API'
        : 'External API';
      return mapAxiosErrorToCustomError(err, apiName, req);
    default:
      if (err.code && typeof err.code === 'number') {
        return mapGrpcErrorToCustomError(err, req);
      }
      return createUnknownError(err, req);
  }
};

////////////////////////////////////////////
// Utility Functions ///////////////////////
////////////////////////////////////////////

export const mapErrorToCategory = (err) => {
  if (!err) return ErrorCategories.SERVER_ERROR.UNKNOWN;

  if (err.category) return err.category;

  if (err.isJoi || err.name === 'ValidationError') {
    return ErrorCategories.CLIENT_ERROR.VALIDATION;
  }

  if (err.name === 'FirebaseAuthError') {
    return ErrorCategories.CLIENT_ERROR.AUTHENTICATION;
  }

  if (err.name === 'FirebaseError' && err.code?.startsWith('firestore/')) {
    return ErrorCategories.SERVER_ERROR.DATABASE;
  }

  if (err.name === 'AxiosError') {
    return ErrorCategories.SERVER_ERROR.EXTERNAL_API;
  }

  if (err.code && typeof err.code === 'number') {
    return getErrorCategory(
      grpcToHttpStatus[err.code] || HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return ErrorCategories.SERVER_ERROR.UNKNOWN;
};

export const mapErrorToCode = (err) => {
  if (!err) return ErrorCodes.UNKNOWN_ERROR;

  if (err.errorCode) return err.errorCode;

  if (err.isJoi || err.name === 'ValidationError') {
    return ErrorCodes.INVALID_INPUT;
  }

  if (err.name === 'FirebaseAuthError') {
    return (
      firebaseAuthToErrorCode[err.code] || ErrorCodes.FIREBASE_AUTH_ERROR
    );
  }

  if (err.name === 'FirebaseError' && err.code?.startsWith('firestore/')) {
    return (
      firestoreToErrorCode[err.code] || ErrorCodes.FIREBASE_DATABASE_ERROR
    );
  }

  if (err.name === 'AxiosError') {
    return ErrorCodes.API_RESPONSE_ERROR;
  }

  if (err.code && typeof err.code === 'number') {
    return grpcToErrorCode[err.code] || ErrorCodes.GRPC_ERROR;
  }

  return ErrorCodes.UNKNOWN_ERROR;
};

export const mapErrorToStatusCode = (err) => {
  if (!err) return HttpStatusCodes.INTERNAL_SERVER_ERROR;

  if (err.statusCode) return err.statusCode;

  if (err.isJoi || err.name === 'ValidationError') {
    return HttpStatusCodes.BAD_REQUEST;
  }

  if (err.name === 'FirebaseAuthError') {
    return (
      firebaseAuthToHttpStatus[err.code] || HttpStatusCodes.UNAUTHORIZED
    );
  }

  if (err.name === 'FirebaseError' && err.code?.startsWith('firestore/')) {
    return (
      firestoreToHttpStatus[err.code] ||
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  if (err.name === 'AxiosError') {
    return err.response?.status || HttpStatusCodes.BAD_GATEWAY;
  }

  if (err.code && typeof err.code === 'number') {
    return (
      grpcToHttpStatus[err.code] || HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return HttpStatusCodes.INTERNAL_SERVER_ERROR;
};
