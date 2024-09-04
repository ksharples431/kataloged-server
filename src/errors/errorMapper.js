import pkg from '@grpc/grpc-js';
import HttpError from './httpErrorModel.js';
import {
  HttpStatusCodes,
  ErrorCategories,
  ErrorCodes,
  getErrorCategory,
} from './errorConstraints.js';

const { Status } = pkg;

// Utility function to create a standardized HttpError
const createHttpError = (
  message,
  statusCode,
  errorCode,
  details = null
) => {
  const category = getErrorCategory(statusCode);
  return new HttpError(message, statusCode, errorCode, details, category);
};

// Map gRPC errors to HttpErrors
export const mapGrpcErrorToHttpError = (err) => {
  const errorMap = {
    [Status.NOT_FOUND]: createHttpError(
      'Resource not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND
    ),
    [Status.INVALID_ARGUMENT]: createHttpError(
      'Invalid request',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT
    ),
    [Status.UNAUTHENTICATED]: createHttpError(
      'Unauthenticated',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS
    ),
    [Status.PERMISSION_DENIED]: createHttpError(
      'Permission denied',
      HttpStatusCodes.FORBIDDEN,
      ErrorCodes.PERMISSION_DENIED
    ),
    [Status.ALREADY_EXISTS]: createHttpError(
      'Resource already exists',
      HttpStatusCodes.CONFLICT,
      ErrorCodes.RESOURCE_ALREADY_EXISTS
    ),
  };

  return (
    errorMap[err.code] ||
    createHttpError(
      err.message || 'Internal Server Error',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.GRPC_ERROR
    )
  );
};

// Map Axios errors to HttpErrors
export const mapAxiosErrorToHttpError = (err, apiName = 'API') => {
  if (err.response) {
    const statusCode = err.response.status;
    const errorMessage =
      err.response.data?.error?.message ||
      err.response.data?.message ||
      err.message;

    const commonErrorMap = {
      [HttpStatusCodes.BAD_REQUEST]: createHttpError(
        `Bad Request: ${errorMessage}`,
        HttpStatusCodes.BAD_REQUEST,
        ErrorCodes.INVALID_INPUT
      ),
      [HttpStatusCodes.UNAUTHORIZED]: createHttpError(
        `Unauthorized: ${errorMessage}`,
        HttpStatusCodes.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS
      ),
      [HttpStatusCodes.FORBIDDEN]: createHttpError(
        `Forbidden: ${errorMessage}`,
        HttpStatusCodes.FORBIDDEN,
        ErrorCodes.PERMISSION_DENIED
      ),
      [HttpStatusCodes.NOT_FOUND]: createHttpError(
        `Not Found: ${errorMessage}`,
        HttpStatusCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND
      ),
      [HttpStatusCodes.TOO_MANY_REQUESTS]: createHttpError(
        `Too Many Requests: ${errorMessage}`,
        HttpStatusCodes.TOO_MANY_REQUESTS,
        ErrorCodes.RATE_LIMIT_EXCEEDED
      ),
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createHttpError(
        `Internal Server Error: ${errorMessage}`,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        ErrorCodes.API_RESPONSE_ERROR
      ),
    };

    const googleBooksErrorMap = {
      [HttpStatusCodes.FORBIDDEN]: createHttpError(
        'API access forbidden. Please check API key.',
        HttpStatusCodes.FORBIDDEN,
        ErrorCodes.API_REQUEST_FAILED
      ),
      [HttpStatusCodes.TOO_MANY_REQUESTS]: createHttpError(
        'API rate limit exceeded. Please try again later.',
        HttpStatusCodes.TOO_MANY_REQUESTS,
        ErrorCodes.RATE_LIMIT_EXCEEDED
      ),
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createHttpError(
        'Google Books API is currently unavailable.',
        HttpStatusCodes.SERVICE_UNAVAILABLE,
        ErrorCodes.SERVICE_UNAVAILABLE
      ),
      501: createHttpError(
        'Google Books API is currently unavailable.',
        HttpStatusCodes.SERVICE_UNAVAILABLE,
        ErrorCodes.SERVICE_UNAVAILABLE
      ),
      502: createHttpError(
        'Google Books API is currently unavailable.',
        HttpStatusCodes.SERVICE_UNAVAILABLE,
        ErrorCodes.SERVICE_UNAVAILABLE
      ),
      503: createHttpError(
        'Google Books API is currently unavailable.',
        HttpStatusCodes.SERVICE_UNAVAILABLE,
        ErrorCodes.SERVICE_UNAVAILABLE
      ),
      504: createHttpError(
        'Google Books API is currently unavailable.',
        HttpStatusCodes.SERVICE_UNAVAILABLE,
        ErrorCodes.SERVICE_UNAVAILABLE
      ),
    };

    const errorMap =
      apiName === 'Google Books API'
        ? { ...commonErrorMap, ...googleBooksErrorMap }
        : commonErrorMap;

    return (
      errorMap[statusCode] ||
      createHttpError(
        `${apiName} Error: ${errorMessage}`,
        statusCode,
        ErrorCodes.API_RESPONSE_ERROR
      )
    );
  } else if (err.request) {
    return createHttpError(
      `No response received from ${apiName}`,
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      ErrorCodes.API_TIMEOUT
    );
  } else {
    return createHttpError(
      `Error setting up the request to ${apiName}: ${err.message}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.API_REQUEST_FAILED
    );
  }
};

// Map Firebase errors to HttpErrors
export const mapFirebaseErrorToHttpError = (err) => {
  // If the error is already a HttpError, return it
  if (err instanceof HttpError) {
    return err;
  }

  // Use the original error if it exists
  const error = err.originalError || err;

  const errorMap = {
    'auth/id-token-expired': createHttpError(
      'Token has expired',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.TOKEN_EXPIRED
    ),
    'auth/id-token-revoked': createHttpError(
      'Token has been revoked',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.TOKEN_INVALID
    ),
    'auth/invalid-id-token': createHttpError(
      'Invalid token',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.TOKEN_INVALID
    ),
    'auth/user-disabled': createHttpError(
      'User account has been disabled',
      HttpStatusCodes.FORBIDDEN,
      ErrorCodes.USER_NOT_FOUND
    ),
    'auth/user-not-found': createHttpError(
      'User not found',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.USER_NOT_FOUND
    ),
    'auth/invalid-email': createHttpError(
      'Invalid email address',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT
    ),
    'auth/email-already-in-use': createHttpError(
      'Email is already in use',
      HttpStatusCodes.CONFLICT,
      ErrorCodes.RESOURCE_ALREADY_EXISTS
    ),
    'auth/weak-password': createHttpError(
      'Password is too weak',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT
    ),
    'auth/wrong-password': createHttpError(
      'Incorrect password',
      HttpStatusCodes.UNAUTHORIZED,
      ErrorCodes.INVALID_CREDENTIALS
    ),
    'auth/too-many-requests': createHttpError(
      'Too many requests, please try again later',
      HttpStatusCodes.TOO_MANY_REQUESTS,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    ),
    'permission-denied': createHttpError(
      'Permission denied to access Firestore',
      HttpStatusCodes.FORBIDDEN,
      ErrorCodes.PERMISSION_DENIED
    ),
    unavailable: createHttpError(
      'Firestore is currently unavailable',
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      ErrorCodes.SERVICE_UNAVAILABLE
    ),
    'data-loss': createHttpError(
      'Unrecoverable data loss or corruption',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR
    ),
    'deadline-exceeded': createHttpError(
      'Deadline exceeded for Firestore operation',
      HttpStatusCodes.GATEWAY_TIMEOUT,
      ErrorCodes.API_TIMEOUT
    ),
    'database/permission-denied': createHttpError(
      'Permission denied to access Realtime Database',
      HttpStatusCodes.FORBIDDEN,
      ErrorCodes.PERMISSION_DENIED
    ),
    'database/unavailable': createHttpError(
      'Realtime Database is currently unavailable',
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      ErrorCodes.SERVICE_UNAVAILABLE
    ),
    'storage/object-not-found': createHttpError(
      'Requested file does not exist',
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND
    ),
    'storage/unauthorized': createHttpError(
      'User is not authorized to perform the desired action',
      HttpStatusCodes.FORBIDDEN,
      ErrorCodes.PERMISSION_DENIED
    ),
    'storage/canceled': createHttpError(
      'User canceled the upload',
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.API_REQUEST_FAILED
    ),
    'storage/unknown': createHttpError(
      'Unknown error occurred, inspect the server response',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.UNEXPECTED_ERROR
    ),
  };

  return (
    errorMap[error.code] ||
    createHttpError(
      error.message || 'Firebase Authentication error',
      error.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.FIREBASE_AUTH_ERROR,
      null,
      null,
      error.stack
    )
  );
};

// Map other types of errors
export const mapOtherErrors = (err) => {
  if (err instanceof TypeError) {
    return createHttpError(
      `Type Error: ${err.message}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INTERNAL_SERVER_ERROR
    );
  } else if (err instanceof ReferenceError) {
    return createHttpError(
      `Reference Error: ${err.message}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.INTERNAL_SERVER_ERROR
    );
  } else if (err instanceof SyntaxError) {
    return createHttpError(
      `Syntax Error: ${err.message}`,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT
    );
  } else if (err instanceof URIError) {
    return createHttpError(
      `URI Error: ${err.message}`,
      HttpStatusCodes.BAD_REQUEST,
      ErrorCodes.INVALID_INPUT
    );
  } else if (err.name === 'MongoError') {
    return createHttpError(
      `Database Error: ${err.message}`,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR
    );
  } else {
    return createHttpError(
      err.message || 'An unknown error occurred',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.UNEXPECTED_ERROR
    );
  }
};

export { createHttpError };
