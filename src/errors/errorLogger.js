import { logEntry, loggingConfig } from '../config/cloudLoggingConfig.js';
import { ErrorCategories, getErrorCategory } from './errorConstraints.js';

const errorLogs = new Map();
const ERROR_LOG_LIMIT = 10;
const ERROR_LOG_WINDOW = 60000; // 1 minute

export const shouldLogError = (errorKey) => {
  const now = Date.now();
  const errorLog = errorLogs.get(errorKey) || { count: 0, firstLog: now };

  if (now - errorLog.firstLog > ERROR_LOG_WINDOW) {
    errorLog.count = 1;
    errorLog.firstLog = now;
  } else if (errorLog.count < ERROR_LOG_LIMIT) {
    errorLog.count++;
  } else {
    return false;
  }

  errorLogs.set(errorKey, errorLog);
  return true;
};

export const getSeverity = (category) => {
  switch (category) {
    case ErrorCategories.SERVER_ERROR.INTERNAL:
    case ErrorCategories.SERVER_ERROR.DATABASE:
      return 'CRITICAL';
    case ErrorCategories.SERVER_ERROR.SERVICE_UNAVAILABLE:
    case ErrorCategories.SERVER_ERROR.EXTERNAL_API:
    case ErrorCategories.SERVER_ERROR.UNKNOWN:
      return 'ERROR';
    case ErrorCategories.CLIENT_ERROR.AUTHENTICATION:
    case ErrorCategories.CLIENT_ERROR.AUTHORIZATION:
      return 'WARNING';
    case ErrorCategories.CLIENT_ERROR.VALIDATION:
    case ErrorCategories.CLIENT_ERROR.NOT_FOUND:
    case ErrorCategories.CLIENT_ERROR.CONFLICT:
    case ErrorCategories.CLIENT_ERROR.RATE_LIMIT:
    case ErrorCategories.CLIENT_ERROR.BAD_REQUEST:
      return 'NOTICE';
    default:
      return 'INFO';
  }
};

export const logError = (error, req) => {
  const errorKey = `${error.statusCode}:${error.message}`;

  if (shouldLogError(errorKey)) {
    const category = error.category || getErrorCategory(error.statusCode);
    const severity = getSeverity(category);

    if (
      loggingConfig.errorOnly &&
      !loggingConfig.logLevels.includes(severity)
    ) {
      return; // Skip non-error logs in error-only mode
    }

    const logMessage = {
      severity,
      message: error.message,
      statusCode: error.statusCode,
      category,
      errorCode: error.errorCode,
      requestId: req.id,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.uid || 'unauthenticated',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Always include original error if it exists, and filter its stack as well
    if (error.originalError && error.originalError.stack) {
      logMessage.originalError = {
        message: error.originalError.message,
        stack: error.originalError.stack,
      };
    }

    // Add additional details based on error category (as in previous examples)
    switch (category) {
      case ErrorCategories.SERVER_ERROR.DATABASE:
        logMessage.databaseDetails = {
          operation: error.operation,
          collection: error.collection,
        };
        break;
      case ErrorCategories.SERVER_ERROR.EXTERNAL_API:
        logMessage.apiDetails = {
          apiName: error.apiName,
          endpoint: error.endpoint,
        };
        break;
      case ErrorCategories.CLIENT_ERROR.VALIDATION:
        logMessage.validationErrors = error.details;
        break;
      case ErrorCategories.CLIENT_ERROR.RATE_LIMIT:
        logMessage.rateLimitDetails = {
          limit: error.limit,
          current: error.current,
        };
        break;
    }

    // Log request body only in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      logMessage.requestBody = req.body;
    }

    // Log the error
    logEntry(logMessage).catch(console.error);

    if (severity === 'CRITICAL') {
      console.error('CRITICAL ERROR:', logMessage);
    }
  }
};