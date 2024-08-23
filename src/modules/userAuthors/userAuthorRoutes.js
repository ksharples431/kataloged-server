import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import {
  getUserAuthors,
  getUserAuthorBooks,
} from './userAuthorController.js';

const router = express.Router();

router.use('/userBooks', apiLimiter);

router.get(
  '/userBooks/:uid/authors/:author/books',
  verifyToken,
  asyncRouteHandler(getUserAuthorBooks)
);
router.get(
  '/userBooks/:uid/authors',
  verifyToken,
  asyncRouteHandler(getUserAuthors)
);

export default router;
