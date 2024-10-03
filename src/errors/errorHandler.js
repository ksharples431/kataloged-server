import { wrapError } from './errorUtils.js';
import { logError } from './errorLogger.js';
import { mapErrorToCustomError } from './errorMappings.js';
import { logEntry } from '../config/cloudLoggingConfig.js';
import { ErrorCodes, ErrorCategories } from './errorMappings.js';

// Global error handler for Express applications
export const globalErrorHandler = async (err, req, res, next) => {
  try {
    console.error('Original error:', sanitizeError(err));

    // Map the error to a custom error using the new mappings
    let error = mapErrorToCustomError(err, req);

    // Wrap the error to ensure a consistent structure
    error = wrapError(error, {
      requestId: req.id,
      errorCode: error.errorCode || err.errorCode,
    });

    // Log the error using the updated logger
    await logError(error, req);

    // Prepare the error response to send back to the client
    const response = {
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      errorCode: error.errorCode || ErrorCodes.UNKNOWN_ERROR,
      category: error.category || ErrorCategories.SERVER_ERROR,
      requestId: error.requestId || req.id,
    };

    // Add error details if present
    if (error.details) {
      response.details = sanitizeErrorDetails(error.details);
    }

    // Send the error response back to the client
    res.status(response.statusCode).json(response);
  } catch (handlerError) {
    // Handle errors in the error handler itself
    await logEntry({
      severity: 'ERROR',
      message: 'Error in error handler',
      error: handlerError,
      originalError: sanitizeError(err),
      requestId: req.id,
    }).catch(console.error);

    // Send a generic response if headers haven't been sent
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
      JSON.stringify(details, (key, value) =>
        key === 'originalError' ? sanitizeError(value) : value
      )
    );
  }
  return details;
}
