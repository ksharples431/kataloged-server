import { logEntry, loggingConfig } from '../config/cloudLoggingConfig.js';

/**
 * Logs the error with the appropriate structure and details.
 *
 * @param {Object} error - The error object from express-error-handler.
 * @param {Object} req - The request object (server-side).
 */
export const logError = (error, req) => {
  const errorKey = `${error.statusCode}:${error.message}`;

  if (shouldLogError(errorKey)) {
    const severity = getSeverityFromStatusCode(error.statusCode); // Simplify severity based on status code

    // If logging config restricts non-error logs, we skip based on severity
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
      errorCode: error.errorCode || 'UNKNOWN_ERROR',
      requestId: req.id || 'unknown',
      url: req.originalUrl || req.url,
      method: req.method || 'UNKNOWN',
      ip: req.ip || 'unknown',
      userId: req.user?.uid || 'unauthenticated',
      userAgent: req.headers?.['user-agent'] || req.userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      requestBody: req.body || {},
    };

    // Include original error stack if available
    if (error.originalError && error.originalError.stack) {
      logMessage.originalError = {
        message: error.originalError.message,
        stack: error.originalError.stack,
      };
    }

    // If not in production, include the request body for debugging purposes
    if (process.env.NODE_ENV !== 'production') {
      logMessage.requestBody = req.body;
    }

    // Log the error entry using Cloud Logging configuration
    logEntry(logMessage).catch(console.error);

    if (severity === 'CRITICAL') {
      console.error('CRITICAL ERROR:', logMessage); // Output critical errors to the console
    }
  }
};

/**
 * Route to log frontend (client-side) errors.
 * This allows client-side errors to be logged on the server.
 */
export const logFrontendError = async (req, res) => {
  const {
    message,
    name,
    statusCode,
    errorCode,
    category,
    requestId,
    url,
    userAgent,
  } = req.body;

  if (!message || !name) {
    return res.status(400).json({ message: 'Invalid error log data' });
  }

  try {
    await logError(
      {
        message,
        name,
        statusCode: statusCode || 500,
        errorCode: errorCode || 'UNKNOWN_ERROR',
        category: category || 'UnknownError',
        requestId,
        url,
        userAgent,
      },
      { id: requestId, originalUrl: url, method: 'POST', ip: req.ip }
    );

    res.status(200).json({ message: 'Error logged successfully' });
  } catch (error) {
    console.error('Error logging frontend error:', error);
    res.status(500).json({ message: 'Failed to log error' });
  }
};

/**
 * Determines the severity level of an error based on its HTTP status code.
 *
 * @param {number} statusCode - The HTTP status code.
 * @returns {string} - The severity level (e.g., 'CRITICAL', 'ERROR', 'WARNING').
 */
const getSeverityFromStatusCode = (statusCode) => {
  if (statusCode >= 500) return 'CRITICAL';
  if (statusCode >= 400) return 'ERROR';
  return 'INFO';
};

/**
 * Determines whether an error should be logged, implementing rate limiting.
 *
 * @param {string} errorKey - Unique key for the error, combining status code and message.
 * @returns {boolean} - Whether the error should be logged based on rate limiting.
 */
const shouldLogError = (errorKey) => {
  const now = Date.now();
  const errorLog = errorLogs.get(errorKey) || { count: 0, firstLog: now };

  // Reset count after log window expires
  if (now - errorLog.firstLog > ERROR_LOG_WINDOW) {
    errorLog.count = 1;
    errorLog.firstLog = now;
  } else if (errorLog.count < ERROR_LOG_LIMIT) {
    errorLog.count++;
  } else {
    return false; // Rate limit exceeded, skip logging
  }

  errorLogs.set(errorKey, errorLog);
  return true;
};

// Map to store error logs and enforce rate limiting
const errorLogs = new Map();
const ERROR_LOG_LIMIT = 10;
const ERROR_LOG_WINDOW = 60000; // 1 minute window for limiting repeated error logs
