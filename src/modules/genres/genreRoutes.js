import express from 'express';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import { getGenres, getGenreBooks } from './genreController.js';

const router = express.Router();

router.use('/genres', apiLimiter);

router.get('/genres/:genre/books', asyncRouteHandler(getGenreBooks));
router.get('/genres', asyncRouteHandler(getGenres));

export default router;
