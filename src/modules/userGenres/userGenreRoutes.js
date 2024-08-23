import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import {
  getUserGenres,
  getUserGenreBooks,
} from './userGenreController.js';

const router = express.Router();

router.use('/userBooks', apiLimiter);

router.get(
  '/userBooks/:uid/genres/:genre/books',
  verifyToken,
  asyncRouteHandler(getUserGenreBooks)
);
router.get(
  '/userBooks/:uid/genres',
  verifyToken,
  asyncRouteHandler(getUserGenres)
);

export default router;
