import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
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

router.get('/books/check/:bid', handleAsyncRoute(checkBookExists));
router.get('/books/:bid', handleAsyncRoute(getBookById));
router.get('/books', handleAsyncRoute(getBooks));

router.post(
  '/books',
  verifyToken,
  validateRequest(createBookSchema),
  handleAsyncRoute(createBook)
);

router.put(
  '/books/:bid',
  verifyToken,
  validateRequest(updateBookSchema),
  handleAsyncRoute(updateBook)
);

router.delete('/books/:bid', verifyToken, handleAsyncRoute(deleteBook));

export default router;
