import express from 'express';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import { getAuthors, getAuthorBooks } from './authorController.js';

const router = express.Router();

router.use('/authors', apiLimiter);

router.get('/authors/:author/books', asyncRouteHandler(getAuthorBooks));
router.get('/authors', asyncRouteHandler(getAuthors));

export default router;
