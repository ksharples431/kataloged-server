import express from 'express';
import {
  addUser,
  getUser,
  editUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/users', addUser);
router.get('/users/:userId', getUser);
router.put('/users/:userId', editUser);
router.delete('/users/:userId', deleteUser);

export default router;
