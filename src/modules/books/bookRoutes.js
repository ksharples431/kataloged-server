import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import { withLogging } from '../../middleware/loggingMiddleware.js';
import { createBookSchema, updateBookSchema } from './bookModel.js';
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

router.get(
  '/books/check/:bid',
  withLogging(asyncRouteHandler(checkBookExists))
);

router.get('/books/:bid', withLogging(asyncRouteHandler(getBookById)));

router.get('/books', withLogging(asyncRouteHandler(getBooks)));

router.post(
  '/books',
  verifyToken,
  validateRequest(createBookSchema),
  withLogging(asyncRouteHandler(createBook))
);

router.put(
  '/books/:bid',
  verifyToken,
  validateRequest(updateBookSchema),
  withLogging(asyncRouteHandler(updateBook))
);

router.delete(
  '/books/:bid',
  verifyToken,
  withLogging(asyncRouteHandler(deleteBook))
);

export default router;
