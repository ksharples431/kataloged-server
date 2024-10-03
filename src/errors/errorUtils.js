import { createCustomError } from './customError.js';
import {
  HttpStatusCodes,
  ErrorCodes,
  ErrorCategories,
} from './errorMappings.js';

export const wrapError = (error, options = {}) => {
  if (error.name === 'CustomError') return error;

  return createCustomError(
    error.message || 'An unknown error occurred',
    options.statusCode ||
      error.statusCode ||
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    options.errorCode || error.errorCode || ErrorCodes.UNKNOWN_ERROR,
    {
      originalError: error,
      details: options.details || error.details || null,
    },
    {
      category:
        options.category || error.category || ErrorCategories.SERVER_ERROR,
      requestId: options.requestId || error.requestId,
      stack: error.stack,
    }
  );
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

export const notFound = (req, res, next) => {
  next(
    createCustomError(
      `Not Found - ${req.originalUrl}`,
      HttpStatusCodes.NOT_FOUND,
      ErrorCodes.RESOURCE_NOT_FOUND,
      { requestId: req.id },
      {
        category: ErrorCategories.CLIENT_ERROR,
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
