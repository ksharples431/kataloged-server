import { HttpStatusCodes } from './errorCategories';

/* ==========================
 * Error Stack and Sanitization Utilities
 * ========================== */

/**
 * Filters the error stack trace to remove unnecessary lines,
 * specifically those from 'node_modules' and internal Node.js files.
 *
 * @param {string} stack - The stack trace string.
 * @returns {string} - The filtered stack trace.
 */
export function filterStack(stack) {
  return stack
    .split('\n')
    .filter(
      (line) =>
        !line.includes('node_modules') && !line.includes('(internal)')
    )
    .join('\n');
}

/**
 * Sanitizes the error object for logging and response purposes,
 * removing circular references and sensitive information.
 *
 * @param {Error} error - The error object to sanitize.
 * @returns {Object} - Sanitized error object.
 */
export function sanitizeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.statusCode && { statusCode: error.statusCode }),
      ...(error.errorCode && { errorCode: error.errorCode }),
      ...(error.requestId && { requestId: error.requestId }),
    };
  }
  return error;
}

/* ==========================
 * Error Logging Utilities
 * ========================== */

const errorLogs = new Map();
const ERROR_LOG_LIMIT = 10;
const ERROR_LOG_WINDOW = 60000; // 1 minute

/**
 * Determines whether the error should be logged based on rate limiting.
 *
 * @param {string} errorKey - A unique key for the error.
 * @returns {boolean} - Whether the error should be logged.
 */
export function shouldLogError(errorKey) {
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
}

/**
 * Determines the severity level based on HTTP status codes.
 *
 * @param {number} statusCode - The HTTP status code.
 * @returns {string} - The log severity level (e.g., 'CRITICAL', 'ERROR', 'INFO').
 */
export function getSeverityFromStatusCode(statusCode) {
  if (statusCode >= 500) return 'CRITICAL';
  if (statusCode >= 400) return 'ERROR';
  return 'INFO';
}
