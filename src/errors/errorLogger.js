import { log, metadata } from '../config/cloudLoggingConfig.js';
import { ErrorCategories, getErrorCategory } from './errorConstraints.js';

const errorLogs = new Map();
const ERROR_LOG_LIMIT = 10;
const ERROR_LOG_WINDOW = 60000; // 1 minute

const shouldLogError = (errorKey) => {
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

const getSeverity = (category) => {
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
      ![
        SeverityLevels.CRITICAL,
        SeverityLevels.ERROR,
        SeverityLevels.WARNING,
        SeverityLevels.NOTICE,
      ].includes(severity)
    ) {
      return; // Skip logging
    }

    const logEntry = {
      severity,
      message: error.message,
      statusCode: error.statusCode,
      category,
      errorCode: error.errorCode,
      requestId: req.id,
      stack: error.stack || null,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.uid || 'unauthenticated',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Add category-specific details
    switch (category) {
      case ErrorCategories.SERVER_ERROR.DATABASE:
        logEntry.databaseDetails = {
          operation: error.operation,
          collection: error.collection,
        };
        break;
      case ErrorCategories.SERVER_ERROR.EXTERNAL_API:
        logEntry.apiDetails = {
          apiName: error.apiName,
          endpoint: error.endpoint,
        };
        break;
      case ErrorCategories.CLIENT_ERROR.VALIDATION:
        logEntry.validationErrors = error.details;
        break;
      case ErrorCategories.CLIENT_ERROR.RATE_LIMIT:
        logEntry.rateLimitDetails = {
          limit: error.limit,
          current: error.current,
        };
        break;
    }

    // Add request body for debug purposes (be cautious with sensitive data)
    if (process.env.NODE_ENV !== 'production') {
      logEntry.requestBody = req.body;
    }

    log.write(log.entry(metadata, logEntry)).catch(console.error);

    // Additional actions based on severity
    if (severity === 'CRITICAL') {
      // TODO: Implement alerting mechanism (e.g., send SMS, trigger PagerDuty)
      console.error('CRITICAL ERROR:', error);
    }
  }
};
