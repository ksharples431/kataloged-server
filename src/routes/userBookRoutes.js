import express from 'express';
import {
  createUserBook,
  getUserBooks,
  getUserBookById,
  updateUserBook,
  deleteUserBook,
  getUserAuthors,
  getUserGenres,
  getUserBooksByAuthor,
  getUserBooksByGenre,
} from '../controllers/userBookController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// User Book routes
router.post('/userBooks', verifyToken, createUserBook);
router.get('/userBooks',  verifyToken, getUserBooks);
router.get('/userBooks/:ubid', verifyToken,  getUserBookById);
router.put('/userBooks/:ubid', verifyToken, updateUserBook);
router.delete('/userBooks/:ubid', verifyToken, deleteUserBook);


// User Author routes
router.get('/userBooks/:uid/authors', verifyToken, getUserAuthors);
router.get(
  '/userBooks/:uid/authors/:author/books',
  verifyToken,
  getUserBooksByAuthor
);
// User Genre routes
router.get('/userBooks/:uid/genres', verifyToken, getUserGenres);
router.get(
  '/userBooks/:uid/genres/:genre/books',
  verifyToken,
  getUserBooksByGenre
);

export default router;
