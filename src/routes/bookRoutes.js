import express from 'express';
import {
  addBook,
  getBook,
  getAllBooks,
  editBook,
  deleteBook,
} from '../controllers/bookController.js';

const router = express.Router();

router.post('/books', addBook);
router.get('/books/:bookId', getBook);
router.get('/books', getAllBooks); // Route to get all books
router.put('/books/:bookId', editBook);
router.delete('/books/:bookId', deleteBook);

export default router;