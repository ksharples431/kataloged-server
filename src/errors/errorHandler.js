import { wrapError } from './errorUtils.js';
import { logError } from './errorLogger.js';
import { mapErrorToCustomError } from './errorMapper.js';
import { logEntry } from '../config/cloudLoggingConfig.js';

export const globalErrorHandler = async (err, req, res, next) => {
  try {
    console.error('Original error:', sanitizeError(err));

    // Map the error to a custom error
    let error = mapErrorToCustomError(err, req);

    // Wrap the error to ensure consistent structure, preserving original error code
    error = wrapError(error, {
      requestId: req.id,
      errorCode: error.errorCode || err.errorCode,
    });

    // Log the error
    await logError(error, req);

    // Prepare the error response object
    const response = {
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      errorCode: error.errorCode || 'UNEXPECTED_ERROR',
      category: error.category || 'ServerError.Unknown',
      requestId: error.requestId || req.id,
    };

    // Add details to the response
    if (error.details) {
      response.details = sanitizeErrorDetails(error.details);
    }

    // Send error response
    res.status(response.statusCode).json(response);
  } catch (handlerError) {

    // Log the error in the error handler
    await logEntry({
      severity: 'ERROR',
      message: 'Error in error handler',
      error: handlerError,
      originalError: sanitizeError(err),
      requestId: req.id,
    }).catch(console.error);

    // Send a generic error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

function sanitizeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Include other non-circular properties as needed
      ...(error.statusCode && { statusCode: error.statusCode }),
      ...(error.errorCode && { errorCode: error.errorCode }),
      ...(error.category && { category: error.category }),
      ...(error.requestId && { requestId: error.requestId }),
    };
  }
  return error;
}

function sanitizeErrorDetails(details) {
  if (details && typeof details === 'object') {
    return JSON.parse(
      JSON.stringify(details, (key, value) => {
        if (key === 'originalError') {
          return sanitizeError(value);
        }
        return value;
      })
    );
  }
  return details;
}
