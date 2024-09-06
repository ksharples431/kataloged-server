import express from 'express';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import { getAuthors, getAuthorBooks } from './authorController.js';

const router = express.Router();

router.use('/authors', apiLimiter);

router.get('/authors/:author/books', handleAsyncRoute(getAuthorBooks));
router.get('/authors', handleAsyncRoute(getAuthors));

export default router;
