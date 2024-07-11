import express from 'express';
import {
  createUserBook,
  getUserBooks,
  getUserBookById,
  // updateUserBook,
  // deleteUserBook,
} from '../controllers/userBookController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createUserBook);
router.get('/',  verifyToken, getUserBooks);
router.get('/:ubid', verifyToken,  getUserBookById);
// router.patch('/:uid/:bid', updateUserBook);
// router.delete('/:uid/:bid', deleteUserBook);

export default router;
