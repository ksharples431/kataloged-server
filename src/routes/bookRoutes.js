import express from 'express';
import {
  createBook,
  getBooks,
  getBookById,
  searchBook,
  // updateBook,
  // deleteBook,
  // getAuthors,
  // getGenres,
  // getBooksByAuthor,
  // getBooksByGenre,
} from '../controllers/bookController.js';

const router = express.Router();

router.post('/', createBook);
router.get('/', getBooks);
router.get('/search', searchBook);
// router.get('/authors', getAuthors);
// router.get('/genres', getGenres);
// router.get('/author/:author', getBooksByAuthor);
// router.get('/genre/:genre', getBooksByGenre);
router.get('/:bid', getBookById);
// router.put('/:bid', updateBook);
// router.delete('/:bid', deleteBook);

export default router;
