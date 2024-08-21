import rateLimit from 'express-rate-limit';
import {
  ErrorCodes,
  HttpStatusCodes,
} from '../errors/errorConstraints.js';
import HttpError from '../errors/httpErrorModel.js';
import config from '../config/config.js';

const isProd = config.server.env === 'production';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: isProd ? config.rateLimit.max : config.rateLimit.max * 10, // More lenient in development
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
  handler: (req, res, next, options) => {
    next(
      new HttpError(
        options.message,
        HttpStatusCodes.TOO_MANY_REQUESTS,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          limit: isProd ? config.rateLimit.max : config.rateLimit.max * 10,
          windowMs: config.rateLimit.windowMs,
        }
      )
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: isProd ? config.rateLimit.auth.max : config.rateLimit.auth.max * 4, // More lenient in development
  message: 'Too many login attempts, please try again after an hour.',
  handler: (req, res, next, options) => {
    next(
      new HttpError(
        options.message,
        HttpStatusCodes.TOO_MANY_REQUESTS,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          limit: isProd
            ? config.rateLimit.auth.max
            : config.rateLimit.auth.max * 4,
          windowMs: config.rateLimit.auth.windowMs,
        }
      )
    );
  },
});
