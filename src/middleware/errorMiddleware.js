import errorHandler from 'express-error-handler'; // Import the middleware
import rateLimit from 'express-rate-limit';
import { logEntry } from '../config/cloudLoggingConfig.js';
import { logError } from '../errors/errorLogging.js';

// ==============================
// Initialize the error handler as middleware
// ==============================
export const globalErrorHandler = errorHandler({
  fallbackMessage: 'An unexpected error occurred',
  defaultStatusCode: 500,
  log: async (error, req) => {
    await logError(error, req); // Custom logging function for error
  },
});

// ==============================
// Request Logging Middleware
// ==============================
export const requestLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logEntry({
      severity: 'INFO',
      message: `${req.method} ${req.originalUrl}`,
      statusCode: res.statusCode,
      duration,
      requestId: req.id,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userId: req.user?.uid || 'unauthenticated',
      url: req.originalUrl,
      method: req.method,
      environment: process.env.NODE_ENV,
    }).catch(console.error);
  });
  next();
};

// ==============================
// Rate Limiting Middleware
// ==============================
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later.',
      statusCode: 429,
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many login attempts, please try again after an hour.',
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many login attempts, please try again after an hour.',
      statusCode: 429,
    });
  },
});

// ==============================
// Not Found Handler (404)
// ==============================
export const notFoundHandler = (req, res, next) => {
  const notFoundError = new Error(`Not Found - ${req.originalUrl}`);
  notFoundError.status = 404;
  next(notFoundError); // Forward to error handler
};

// ==============================
// Combine Middleware and Handlers
// ==============================
// export const errorMiddleware = [
//   requestLoggingMiddleware, // Logs requests
//   apiLimiter, // API rate limiting
//   authLimiter, // Auth rate limiting
//   notFoundHandler, // Handles 404 errors
//   globalErrorHandler, // Handles all other errors
// ];
