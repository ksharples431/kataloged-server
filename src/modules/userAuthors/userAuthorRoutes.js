import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
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
  handleAsyncRoute(getUserAuthorBooks)
);
router.get(
  '/userBooks/:uid/authors',
  verifyToken,
  handleAsyncRoute(getUserAuthors)
);

export default router;
