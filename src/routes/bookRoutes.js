import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import {
  debugBookStructure,
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBook,
  getAuthors,
  getGenres,
  getBooksByAuthor,
  getBooksByGenre,
} from '../controllers/bookController.js';

const router = express.Router();

// Debug routes
router.get('/debug/book/:bid', debugBookStructure);

// Book routes
router.post('/books', verifyToken, createBook);
router.get('/books', getBooks);
router.get('/books/search', searchBook);
router.get('/books/:bid', getBookById);
router.put('/books/:bid', verifyToken, updateBook);
router.delete('/books/:bid', verifyToken, deleteBook);

// Author routes
router.get('/authors', getAuthors);
router.get('/authors/:author/books', getBooksByAuthor);

// Genre routes
router.get('/genres', getGenres);
router.get('/genres/:genre/books', getBooksByGenre);

export default router;
