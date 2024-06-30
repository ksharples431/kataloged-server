import express from 'express';
import {
  addUserBook,
  getUserBookById,
  getUserBooks,
  updateUserBook,
  deleteUserBook,
} from '../controllers/userBookController.js';

const router = express.Router();

router.post('/user-books', addUserBook);
router.get('/user-books/:id', getUserBookById);
router.get('/users/:uid/books', getUserBooks);
router.patch('/user-books/:id', updateUserBook);
router.delete('/user-books/:id', deleteUserBook);

export default router;
