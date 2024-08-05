import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import {
  getUserBookById,
  getUserBooks,
  createUserBook,
  updateUserBook,
  deleteUserBook,
  // searchUserBook,
} from './userBookController.js';

const router = express.Router();

// User Book routes
// router.get('/userBooks/search', searchUserBook);
router.get('/userBooks/:ubid', verifyToken,  getUserBookById);
router.get('/userBooks',  verifyToken, getUserBooks);

router.post('/userBooks', verifyToken, createUserBook);

router.put('/userBooks/:ubid', verifyToken, updateUserBook);

router.delete('/userBooks/:ubid', verifyToken, deleteUserBook);

export default router;
