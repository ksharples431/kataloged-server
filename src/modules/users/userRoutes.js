import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from './userController.js';
import verifyToken from '../../middleware/tokenMiddleware.js';

const router = express.Router();

// Get all users
router.get('/users', verifyToken, getAllUsers);

// Get user by ID
router.get('/users/:uid', verifyToken, getUserById);

// Update user
router.put('/users/:uid', verifyToken, updateUser);

// Delete user
router.delete('/users/:uid', verifyToken, deleteUser);

export default router;
