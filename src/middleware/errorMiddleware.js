import HttpError from '../models/httpErrorModel.js';
import pkg from '@grpc/grpc-js';

const { Status } = pkg;

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

const mapFirebaseErrorToHttpError = (err) => {
  const errorMap = {
    'auth/id-token-expired': new HttpError('Token has expired', 401),
    'auth/id-token-revoked': new HttpError('Token has been revoked', 401),
    'auth/invalid-id-token': new HttpError('Invalid token', 401),
  };
  return (
    errorMap[err.code] ||
    new HttpError(err.message || 'Authentication error', 401)
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

  if (err.name === 'FirebaseAuthError') {
    error = mapFirebaseErrorToHttpError(err);
  } else if (err.code && typeof err.code === 'number') {
    error = mapGrpcErrorToHttpError(err);
  } else if (err.name === 'ValidationError') {
    error = new HttpError(err.message, 400);
  } else if (err instanceof TypeError || err instanceof ReferenceError) {
    error = new HttpError('An unexpected error occurred', 500);
  } else if (err.name === 'TooManyRequests') {
    error = new HttpError(
      'Too many requests, please try again later',
      429
    );
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
