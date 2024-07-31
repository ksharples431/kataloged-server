import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import {
  login,
  logout,
  signup,
  googleSignIn,
} from './authController.js';

const router = express.Router();

router.get('/auth/login', verifyToken, login);

router.post('/auth/logout', verifyToken, logout);

router.post('/auth/signup', verifyToken, signup);
router.post('/auth/google-signin', verifyToken, googleSignIn);

export default router;
