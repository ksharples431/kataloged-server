import HttpError from '../models/httpErrorModel.js';
import pkg from '@grpc/grpc-js';
import axios from 'axios';

const { Status } = pkg;

// todo: Consider adding a custom logger instead of using console.error for better log management in production.

const mapGrpcErrorToHttpError = (err) => {
  const errorMap = {
    [Status.NOT_FOUND]: new HttpError('Resource not found', 404),
    [Status.INVALID_ARGUMENT]: new HttpError('Invalid request', 400),
    [Status.UNAUTHENTICATED]: new HttpError('Unauthenticated', 401),
    [Status.PERMISSION_DENIED]: new HttpError('Permission denied', 403),
    [Status.ALREADY_EXISTS]: new HttpError('Resource already exists', 409),
  };
  return (
    errorMap[err.code] ||
    new HttpError(err.message || 'Internal Server Error', 500)
  );
};

const mapAxiosErrorToHttpError = (err, apiName = 'API') => {
  if (err.response) {
    const statusCode = err.response.status;
    const errorMessage =
      err.response.data?.error?.message ||
      err.response.data?.message ||
      err.message;

    const commonErrorMap = {
      400: new HttpError(`Bad Request: ${errorMessage}`, 400),
      401: new HttpError(`Unauthorized: ${errorMessage}`, 401),
      403: new HttpError(`Forbidden: ${errorMessage}`, 403),
      404: new HttpError(`Not Found: ${errorMessage}`, 404),
      429: new HttpError(`Too Many Requests: ${errorMessage}`, 429),
      500: new HttpError(`Internal Server Error: ${errorMessage}`, 500),
    };

    const googleBooksErrorMap = {
      403: new HttpError(
        'API access forbidden. Please check API key.',
        403
      ),
      429: new HttpError(
        'API rate limit exceeded. Please try again later.',
        429
      ),
      500: new HttpError(
        'Google Books API is currently unavailable.',
        503
      ),
      501: new HttpError(
        'Google Books API is currently unavailable.',
        503
      ),
      502: new HttpError(
        'Google Books API is currently unavailable.',
        503
      ),
      503: new HttpError(
        'Google Books API is currently unavailable.',
        503
      ),
      504: new HttpError(
        'Google Books API is currently unavailable.',
        503
      ),
    };

    const errorMap =
      apiName === 'Google Books API'
        ? { ...commonErrorMap, ...googleBooksErrorMap }
        : commonErrorMap;

    return (
      errorMap[statusCode] ||
      new HttpError(`${apiName} Error: ${errorMessage}`, statusCode)
    );
  } else if (err.request) {
    return new HttpError(`No response received from ${apiName}`, 503);
  } else {
    return new HttpError(
      `Error setting up the request to ${apiName}: ${err.message}`,
      500
    );
  }
};

const mapFirebaseErrorToHttpError = (err) => {
  const errorMap = {
    // Authentication errors
    'auth/id-token-expired': new HttpError('Token has expired', 401),
    'auth/id-token-revoked': new HttpError('Token has been revoked', 401),
    'auth/invalid-id-token': new HttpError('Invalid token', 401),
    'auth/user-disabled': new HttpError(
      'User account has been disabled',
      403
    ),
    'auth/user-not-found': new HttpError('User not found', 404),
    'auth/invalid-email': new HttpError('Invalid email address', 400),
    'auth/email-already-in-use': new HttpError(
      'Email is already in use',
      409
    ),
    'auth/weak-password': new HttpError('Password is too weak', 400),
    'auth/wrong-password': new HttpError('Incorrect password', 401),
    'auth/too-many-requests': new HttpError(
      'Too many requests, please try again later',
      429
    ),

    // Firestore errors
    'permission-denied': new HttpError(
      'Permission denied to access Firestore',
      403
    ),
    unavailable: new HttpError('Firestore is currently unavailable', 503),
    'data-loss': new HttpError(
      'Unrecoverable data loss or corruption',
      500
    ),
    'deadline-exceeded': new HttpError(
      'Deadline exceeded for Firestore operation',
      504
    ),

    // Realtime Database errors
    'database/permission-denied': new HttpError(
      'Permission denied to access Realtime Database',
      403
    ),
    'database/unavailable': new HttpError(
      'Realtime Database is currently unavailable',
      503
    ),

    // Storage errors
    'storage/object-not-found': new HttpError(
      'Requested file does not exist',
      404
    ),
    'storage/unauthorized': new HttpError(
      'User is not authorized to perform the desired action',
      403
    ),
    'storage/canceled': new HttpError('User canceled the upload', 400),
    'storage/unknown': new HttpError(
      'Unknown error occurred, inspect the server response',
      500
    ),
  };

  return (
    errorMap[err.code] ||
    new HttpError(err.message || 'Firebase Authentication error', 500)
  );
};

// Middleware to handle 404 errors
export const notFound = (req, res, next) => {
  next(new HttpError(`Not Found - ${req.originalUrl}`, 404));
};

// General error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let error = err;

  if (
    err.name === 'FirebaseAuthError' ||
    err.code?.startsWith('auth/') ||
    err.code?.startsWith('database/') ||
    err.code?.startsWith('storage/')
  ) {
    error = mapFirebaseErrorToHttpError(err);
  } else if (err.code && typeof err.code === 'number') {
    error = mapGrpcErrorToHttpError(err);
  } else if (err.name === 'ValidationError') {
    error = new HttpError(err.message, 400);
  } else if (err instanceof TypeError) {
    error = new HttpError(`Type Error: ${err.message}`, 500);
  } else if (err instanceof ReferenceError) {
    error = new HttpError(`Reference Error: ${err.message}`, 500);
  } else if (err.name === 'TooManyRequests') {
    error = new HttpError(
      'Too many requests, please try again later',
      429
    );
  } else if (axios.isAxiosError(err)) {
    const apiName = err.config?.url?.includes('googleapis.com/books')
      ? 'Google Books API'
      : 'External API';
    error = mapAxiosErrorToHttpError(err, apiName);
  } else if (err instanceof SyntaxError) {
    error = new HttpError(`Syntax Error: ${err.message}`, 400);
  } else if (err instanceof URIError) {
    error = new HttpError(`URI Error: ${err.message}`, 400);
  } else if (err.name === 'MongoError') {
    error = new HttpError(`Database Error: ${err.message}`, 500);
  } else if (!(err instanceof HttpError)) {
    error = new HttpError(err.message || 'An unknown error occurred', 500);
  }

  const response = {
    message: error.message,
    requestId: req.id,
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};
