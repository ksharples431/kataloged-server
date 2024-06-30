import express from 'express';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/users', createUser);
router.get('/users/:uid', getUser);
router.patch('/users/:uid', updateUser);
router.delete('/users/:uid', deleteUser);

export default router;
