import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import {
  createBookSchema,
  updateBookSchema,
} from './bookModel.js';
import {
  checkBookExists,
  getBookById,
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from './bookController.js';

const router = express.Router();

router.use('/books', apiLimiter);

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
