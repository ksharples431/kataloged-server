import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { apiLimiter } from '../../middleware/errorMiddleware.js';
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

// Apply rate limiting for all /books routes
router.use('/books', apiLimiter);

// Route for checking if a book exists by ID
router.get('/books/check/:bid', checkBookExists);

// Route for fetching a book by ID
router.get('/books/:bid', getBookById);

// Route for fetching all books
router.get('/books', getBooks);

// Route for creating a new book, includes token verification and request validation
router.post(
  '/books',
  verifyToken,
  validateRequest(createBookSchema), // Validate the request body against the schema
  createBook
);

// Route for updating a book, includes token verification and request validation
router.put(
  '/books/:bid',
  verifyToken,
  validateRequest(updateBookSchema), // Validate the request body against the schema
  updateBook
);

// Route for deleting a book, includes token verification
router.delete('/books/:bid', verifyToken, deleteBook);

export default router;
