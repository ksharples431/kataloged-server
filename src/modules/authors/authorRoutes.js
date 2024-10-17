import express from 'express';
import { apiLimiter } from '../../middleware/errorMiddleware.js';
import { getAuthors, getAuthorBooks } from './authorController.js';

const router = express.Router();

router.use('/authors', apiLimiter);

router.get('/authors/:author/books', getAuthorBooks);
router.get('/authors', getAuthors);

export default router;
