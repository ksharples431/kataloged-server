import express from 'express';
import {
  googleSignIn,
  signup,
  login,
  logout
} from '../controllers/authController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/google-signin', verifyToken, googleSignIn);
router.post('/auth/signup', verifyToken, signup);
router.get('/auth/login', verifyToken, login);
router.post('/auth/logout', verifyToken, logout);

export default router;
