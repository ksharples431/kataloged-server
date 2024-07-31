import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import {
  getBookById,
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  searchBook,
} from './bookController.js';

const router = express.Router();

// Book routes
router.get('/books/:bid', getBookById);
router.get('/books', getBooks);

router.post('/books', verifyToken, createBook);

router.put('/books/:bid', verifyToken, updateBook);

router.delete('/books/:bid', verifyToken, deleteBook);

router.get('/books/search', searchBook);

export default router;
