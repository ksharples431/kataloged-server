import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import {
  addUserBookSchema,
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

// Apply rate limiting to all user book routes
router.use('/userBooks', apiLimiter);

router.get(
  '/userBooks/:ubid',
  verifyToken,
  asyncRouteHandler(getUserBookById)
);
router.get('/userBooks', verifyToken, asyncRouteHandler(getUserBooks));

router.post(
  '/userBooks',
  verifyToken,
  validateRequest(addUserBookSchema),
  asyncRouteHandler(createUserBook)
);

router.put(
  '/userBooks/:ubid',
  verifyToken,
  validateRequest(updateUserBookSchema),
  asyncRouteHandler(updateUserBook)
);

router.delete(
  '/userBooks/:ubid',
  verifyToken,
  asyncRouteHandler(deleteUserBook)
);

export default router;
