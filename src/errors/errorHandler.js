import HttpError from './httpErrorModel.js';
import {
  handleJoiValidationError,
  handleFirestoreValidationError,
} from './validationErrorHandlers.js';
import axios from 'axios';
import {
  mapGrpcErrorToHttpError,
  mapAxiosErrorToHttpError,
  mapFirebaseErrorToHttpError,
  mapOtherErrors,
  createHttpError,
} from './errorMapper.js';
import {
  HttpStatusCodes,
  ErrorCodes,
  getErrorCategory,
} from './errorConstraints.js';
import { logEntry, loggingConfig } from '../config/cloudLoggingConfig.js';
import { getSeverity } from './errorLogger.js';

export const handleError = (err, req, res, next) => {
  console.error('Original error:', err);

  let error = err;

  if (err.isJoi) {
    error = handleJoiValidationError(err);
  } else if (
    err.name === 'FirebaseAuthError' ||
    (typeof err.code === 'string' &&
      (err.code.startsWith('auth/') ||
        err.code.startsWith('database/') ||
        err.code.startsWith('storage/')))
  ) {
    error = mapFirebaseErrorToHttpError(err);
  } else if (err.code && typeof err.code === 'number') {
    error = mapGrpcErrorToHttpError(err);
  } else if (err.name === 'ValidationError') {
    error = handleFirestoreValidationError(err);
  } else if (axios.isAxiosError(err)) {
    const apiName = err.config?.url?.includes('googleapis.com/books')
      ? 'Google Books API'
      : 'External API';
    error = mapAxiosErrorToHttpError(err, apiName);
  } else if (!(error instanceof HttpError)) {
    error = mapOtherErrors(err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const response = {
    message: error.message || 'An unexpected error occurred',
    statusCode: error.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR,
    errorCode: error.errorCode || ErrorCodes.UNEXPECTED_ERROR,
    category: error.category || getErrorCategory(error.statusCode),
    requestId: req.id,
  };

  if (!isProduction) {
    response.stack = error.stack;
    response.details = error.details;
  }

  const severity = getSeverity(response.category);

  if (
    !loggingConfig.errorOnly ||
    loggingConfig.logLevels.includes(severity)
  ) {
    logEntry({
      severity,
      message: `Error: ${response.message}`,
      errorCode: response.errorCode,
      stack: !isProduction ? error.stack : undefined,
      requestId: req.id,
      userId: req.user?.uid || 'unauthenticated',
      category: response.category,
      statusCode: response.statusCode,
    }).catch(console.error);
  }

  res.status(response.statusCode).json(response);
};

export const asyncRouteHandler =
  (controller) => async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      console.error('Async Route Error:', error);
      if (res.headersSent) {
        return next(error);
      }
      next(error);
    }
  };

export const asyncErrorHandler =
  (errorHandler) => async (err, req, res, next) => {
    try {
      await errorHandler(err, req, res, next);
    } catch (error) {
      console.error('Error in error handler:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };

export const createErrorResponse = (
  message,
  statusCode,
  errorCode,
  details
) => {
  return { message, statusCode, errorCode, details };
};

export const notFound = (req, res, next) => {
  next(
    createHttpError(
      `Not Found - ${req.originalUrl}`,
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND
    )
  );
};
