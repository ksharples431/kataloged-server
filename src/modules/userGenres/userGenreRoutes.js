import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
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
  handleAsyncRoute(getUserGenreBooks)
);
router.get(
  '/userBooks/:uid/genres',
  verifyToken,
  handleAsyncRoute(getUserGenres)
);

export default router;
