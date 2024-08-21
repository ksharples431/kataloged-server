import express from 'express';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import { getAuthors, getBooksByAuthor } from './authorController.js';

const router = express.Router();

// Apply rate limiting to all author routes
router.use('/authors', apiLimiter);

router.get('/authors', asyncRouteHandler(getAuthors));
router.get('/authors/:author/books', asyncRouteHandler(getBooksByAuthor));

export default router;
