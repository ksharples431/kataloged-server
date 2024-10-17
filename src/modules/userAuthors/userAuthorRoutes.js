import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { apiLimiter } from '../../middleware/errorMiddleware.js';
import {
  getUserAuthors,
  getUserAuthorBooks,
} from './userAuthorController.js';

const router = express.Router();

router.use('/userBooks', apiLimiter);

router.get(
  '/userBooks/:uid/authors/:author/books',
  verifyToken,
  getUserAuthorBooks
);
router.get('/userBooks/:uid/authors', verifyToken, getUserAuthors);

export default router;
