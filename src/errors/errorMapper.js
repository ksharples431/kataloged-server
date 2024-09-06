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
