import { logEntry, loggingConfig } from '../config/cloudLoggingConfig.js';
import { ErrorCategories, HttpStatusCodes } from './errorMappings.js';

const errorLogs = new Map();
const ERROR_LOG_LIMIT = 10;
const ERROR_LOG_WINDOW = 60000; // 1 minute

const getCategoryFromStatusCode = (statusCode) => {
  if (statusCode >= 400 && statusCode < 500) {
    return ErrorCategories.CLIENT_ERROR;
  } else if (statusCode >= 500) {
    return ErrorCategories.SERVER_ERROR;
  }
  return ErrorCategories.SERVER_ERROR; // Default to server error for any other status codes
};

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
    case ErrorCategories.SERVER_ERROR:
      return 'CRITICAL';
    case ErrorCategories.CLIENT_ERROR:
      return 'WARNING';
    default:
      return 'INFO';
  }
};

export const logError = (error, req) => {
  const errorKey = `${error.statusCode}:${error.message}`;

  if (shouldLogError(errorKey)) {
    const category =
      error.category || getCategoryFromStatusCode(error.statusCode);
    const severity = getSeverity(category);

    if (
      loggingConfig.errorOnly &&
      !loggingConfig.logLevels.includes(severity)
    ) {
      return;
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

    if (error.originalError && error.originalError.stack) {
      logMessage.originalError = {
        message: error.originalError.message,
        stack: error.originalError.stack,
      };
    }

    if (category === ErrorCategories.SERVER_ERROR) {
      if (error.operation) logMessage.databaseOperation = error.operation;
      if (error.apiName) logMessage.apiName = error.apiName;
    } else if (category === ErrorCategories.CLIENT_ERROR) {
      if (error.details) logMessage.validationErrors = error.details;
    }

    if (process.env.NODE_ENV !== 'production') {
      logMessage.requestBody = req.body;
    }

    logEntry(logMessage).catch(console.error);

    if (severity === 'CRITICAL') {
      console.error('CRITICAL ERROR:', logMessage);
    }
  }
};
