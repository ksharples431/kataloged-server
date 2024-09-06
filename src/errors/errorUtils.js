import { createCustomError } from './customError.js';
import {
  mapErrorToCode,
  mapErrorToCategory,
  mapErrorToStatusCode,
} from './errorMapper.js';
import { getSeverity, shouldLogError } from './errorLogger.js';
import { logEntry, loggingConfig } from '../config/cloudLoggingConfig.js';

export const wrapError = (error, options = {}) => {
  if (error.name === 'CustomError') return error;

  const errorInfo = {
    message: error.message,
    name: error.name,
    code: error.code,
  };

  return createCustomError(
    error.message || 'An unknown error occurred',
    options.statusCode || mapErrorToStatusCode(error),
    options.errorCode || mapErrorToCode(error),
    {
      originalError: errorInfo,
      details: options.details || error.details || null,
    },
    {
      category: options.category || mapErrorToCategory(error),
      requestId: options.requestId,
      stack: error.stack,
    }
  );
};

export const logError = (error, req) => {
  const severity = getSeverity(error.category);
  const errorKey = `${error.statusCode}:${error.message}`;

  if (shouldLogError(errorKey)) {
    if (
      !loggingConfig.errorOnly ||
      loggingConfig.logLevels.includes(severity)
    ) {
      logEntry({
        severity,
        message: `Error: ${error.message}`,
        errorCode: error.errorCode,
        stack: error.stack,
        requestId: req.id,
        userId: req.user?.uid || 'unauthenticated',
        category: error.category,
        statusCode: error.statusCode,
        details: error.details,
      }).catch(console.error);
    }
  }
};

export const handleAsyncMiddleware =
  (handler) => async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(wrapError(error, { requestId: req.id }));
    }
  };

export const handleAsyncRoute = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    console.error('Async Route Error:', error);
    if (res.headersSent) {
      return next(error);
    }
    next(wrapError(error, { requestId: req.id }));
  }
};

export const handleAsyncErrorMiddleware =
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

  // Not Found handler for unrecognized routes
export const notFound = (req, res, next) => {
  next(
    createCustomError(
      `Not Found - ${req.originalUrl}`,
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { requestId: req.id },
      {
        category: ErrorCategories.CLIENT_ERROR.NOT_FOUND,
        stack: null, // Optional, since stack isn't necessary for a 404
      }
    )
  );
};

export const createErrorResponse = (
  message,
  statusCode,
  errorCode,
  details
) => {
  return { message, statusCode, errorCode, details };
};

