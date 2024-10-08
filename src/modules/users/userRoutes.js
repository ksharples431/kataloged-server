import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from './userController.js';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.use('/users', apiLimiter);

// Get all users
router.get('/users', verifyToken, handleAsyncRoute(getAllUsers));

// Get user by ID
router.get('/users/:uid', verifyToken, handleAsyncRoute(getUserById));

// Update user
router.put('/users/:uid', verifyToken, handleAsyncRoute(updateUser));

// Delete user
router.delete('/users/:uid', verifyToken, handleAsyncRoute(deleteUser));

export default router;
