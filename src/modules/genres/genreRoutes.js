import express from 'express';
import { apiLimiter } from '../../middleware/errorMiddleware.js';
import { getGenres, getGenreBooks } from './genreController.js';

const router = express.Router();

router.use('/genres', apiLimiter);

router.get('/genres/:genre/books', getGenreBooks);
router.get('/genres', getGenres);

export default router;
