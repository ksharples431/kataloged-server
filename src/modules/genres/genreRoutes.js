import express from 'express';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import { getGenres, getGenreBooks } from './genreController.js';

const router = express.Router();

router.use('/genres', apiLimiter);

router.get('/genres/:genre/books', handleAsyncRoute(getGenreBooks));
router.get('/genres', handleAsyncRoute(getGenres));

export default router;
