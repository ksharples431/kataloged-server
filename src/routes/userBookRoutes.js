import express from 'express';
import {
  addUserBook,
  getUserBookById,
  getUserBooks,
  updateUserBook,
  deleteUserBook,
} from '../controllers/userBookController.js';

const router = express.Router();

router.post('/', addUserBook);
router.get('/:uid/:bid', getUserBookById);
router.get('/:uid', getUserBooks);
router.patch('/:uid/:bid', updateUserBook);
router.delete('/:uid/:bid', deleteUserBook);

export default router;
