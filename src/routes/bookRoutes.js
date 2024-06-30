import express from 'express';
import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';

const router = express.Router();

router.post('/books', addBook);
router.get('/books', getBooks);
router.get('/books/:bid', getBookById);
router.patch('/books/:bid', updateBook);
router.delete('/books/:bid', deleteBook);

export default router;
