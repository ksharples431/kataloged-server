import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import {
  createBookSchema,
  updateBookSchema,
  searchBookSchema,
  generalSearchSchema,
} from './bookModel.js';
import {
  getBookById,
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  searchBook,
  generalSearch,
  searchGoogleBooks,
  checkBookExists,
} from './bookController.js';

const router = express.Router();

// Apply rate limiting to all book routes
router.use('/books', apiLimiter);

router.get(
  '/books/search',
  validateRequest(searchBookSchema, 'query'),
  asyncRouteHandler(searchBook)
);
router.get(
  '/books/google-search',
  validateRequest(searchBookSchema, 'query'),
  asyncRouteHandler(searchGoogleBooks)
);
router.get(
  '/books/general-search',
  validateRequest(generalSearchSchema, 'query'),
  asyncRouteHandler(generalSearch)
);

router.get('/books/check/:bid', asyncRouteHandler(checkBookExists));
router.get('/books/:bid', asyncRouteHandler(getBookById));
router.get('/books', asyncRouteHandler(getBooks));

router.post(
  '/books',
  verifyToken,
  validateRequest(createBookSchema),
  asyncRouteHandler(createBook)
);

router.put(
  '/books/:bid',
  verifyToken,
  validateRequest(updateBookSchema),
  asyncRouteHandler(updateBook)
);

router.delete('/books/:bid', verifyToken, asyncRouteHandler(deleteBook));

export default router;
