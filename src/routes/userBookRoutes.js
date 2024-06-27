import express from 'express';
import {
  relateBookToUser,
  getUserBooks,
  getBookUsers,
} from '../controllers/userBookController.js';

const router = express.Router();

router.post('/userBooks', relateBookToUser);
router.get('/users/:userId/books', getUserBooks);
router.get('/books/:bookId/users', getBookUsers);

export default router;
