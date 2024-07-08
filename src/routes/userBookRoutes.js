import express from 'express';
import {
  createUserBook,
  getUserBooks,
  // getUserBookById,
  // updateUserBook,
  // deleteUserBook,
} from '../controllers/userBookController.js';

const router = express.Router();

router.post('/', createUserBook);
router.get('/', getUserBooks);
// router.get('/:uid/:bid', getUserBookById);
// router.patch('/:uid/:bid', updateUserBook);
// router.delete('/:uid/:bid', deleteUserBook);

export default router;
