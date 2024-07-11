import express from 'express';
import {
  googleSignIn,
  signup,
  login,
  logout
} from '../controllers/authController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/google-signin', verifyToken, googleSignIn);
router.post('/signup', verifyToken, signup);
router.get('/login', verifyToken, login);
router.post('/logout', verifyToken, logout);

export default router;
