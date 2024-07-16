import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import {
  getUserById,
  // updateUser,
  // deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/:uid', verifyToken, getUserById);
// router.patch('/:uid', updateUser);
// router.delete('/:uid', deleteUser);

export default router;
