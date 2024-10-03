import rateLimit from 'express-rate-limit';
import {
  ErrorCodes,
  HttpStatusCodes,
  ErrorCategories,
} from '../errors/errorMappings.js';
import { createCustomError } from '../errors/customError.js';
import config from '../config/config.js';

const isProd = config.server.env === 'production';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: isProd ? config.rateLimit.max : config.rateLimit.max * 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
  handler: (req, res, next, options) => {
    next(
      createCustomError(
        options.message,
        HttpStatusCodes.TOO_MANY_REQUESTS,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          limit: isProd ? config.rateLimit.max : config.rateLimit.max * 10,
          windowMs: config.rateLimit.windowMs,
          requestId: req.id,
        },
        {
          category: ErrorCategories.CLIENT_ERROR, 
        }
      )
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: isProd ? config.rateLimit.auth.max : config.rateLimit.auth.max * 40,
  message: 'Too many login attempts, please try again after an hour.',
  handler: (req, res, next, options) => {
    next(
      createCustomError(
        options.message,
        HttpStatusCodes.TOO_MANY_REQUESTS,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          limit: isProd
            ? config.rateLimit.auth.max
            : config.rateLimit.auth.max * 40,
          windowMs: config.rateLimit.auth.windowMs,
          requestId: req.id,
        },
        {
          category: ErrorCategories.CLIENT_ERROR,
        }
      )
    );
  },
});
