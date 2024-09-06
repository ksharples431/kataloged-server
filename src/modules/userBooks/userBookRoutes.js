import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
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

router.get(
  '/userBooks/:ubid',
  verifyToken,
  handleAsyncRoute(getUserBookById)
);
router.get('/userBooks', verifyToken, handleAsyncRoute(getUserBooks));

router.post(
  '/userBooks',
  verifyToken,
  validateRequest(createUserBookSchema),
  handleAsyncRoute(createUserBook)
);

router.put(
  '/userBooks/:ubid',
  verifyToken,
  validateRequest(updateUserBookSchema),
  handleAsyncRoute(updateUserBook)
);

router.delete(
  '/userBooks/:ubid',
  verifyToken,
  handleAsyncRoute(deleteUserBook)
);

export default router;
