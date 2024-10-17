import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { apiLimiter } from '../../middleware/errorMiddleware.js';
import {
  createUserBookSchema,
  updateUserBookSchema,
} from './userBookModel.js';
import {
  getUserBookById,
  getUserBooks,
  createUserBook,
  updateUserBook,
  deleteUserBook,
} from './userBookController.js';

const router = express.Router();

router.use('/userBooks', apiLimiter);

router.get('/userBooks/:ubid', verifyToken, getUserBookById);
router.get('/userBooks', verifyToken, getUserBooks);

router.post(
  '/userBooks',
  verifyToken,
  validateRequest(createUserBookSchema, 'body'),
  createUserBook
);

router.put(
  '/userBooks/:ubid',
  verifyToken,
  validateRequest(updateUserBookSchema, 'body'),
  updateUserBook
);

router.delete('/userBooks/:ubid', verifyToken, deleteUserBook);

export default router;
