import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import {
  getUserAuthors,
  getUserBooksByAuthor,
} from './userAuthorController.js';

const router = express.Router();

// User Author routes
router.get('/userBooks/:uid/authors', verifyToken, getUserAuthors);
router.get(
  '/userBooks/:uid/authors/:author/books',
  verifyToken,
  getUserBooksByAuthor
);

export default router;
