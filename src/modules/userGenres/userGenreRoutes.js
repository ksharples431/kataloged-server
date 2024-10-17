import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { apiLimiter } from '../../middleware/errorMiddleware.js';
import {
  getUserGenres,
  getUserGenreBooks,
} from './userGenreController.js';

const router = express.Router();

router.use('/userBooks', apiLimiter);

router.get(
  '/userBooks/:uid/genres/:genre/books',
  verifyToken,
  getUserGenreBooks
);
router.get('/userBooks/:uid/genres', verifyToken, getUserGenres);

export default router;
