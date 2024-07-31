import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import {
  getUserGenres,
  getUserBooksByGenre,
} from './userGenreController.js';

const router = express.Router();

// User Genre routes
router.get('/userBooks/:uid/genres', verifyToken, getUserGenres);
router.get(
  '/userBooks/:uid/genres/:genre/books',
  verifyToken,
  getUserBooksByGenre
);

export default router;
