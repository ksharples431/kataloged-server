import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import {
  getBookById,
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  searchBook,
  generalSearch,
  searchGoogleBooks
} from './bookController.js';

const router = express.Router();

// Book routes
router.get('/books/search', searchBook); //must be before and :bid routes
router.get('/books/google-search', searchGoogleBooks);
router.get('/books/general-search', generalSearch);
router.get('/books/:bid', getBookById);
router.get('/books', getBooks);

router.post('/books', verifyToken, createBook);

router.put('/books/:bid', verifyToken, updateBook);

router.delete('/books/:bid', verifyToken, deleteBook);


export default router;
