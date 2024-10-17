import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { authLimiter } from '../../middleware/errorMiddleware.js';
import { login, logout, signup, googleSignIn } from './authController.js';

const router = express.Router();

router.use('/auth', authLimiter);

router.get('/auth/login', verifyToken, login);
router.post('/auth/logout', verifyToken, logout);
router.post('/auth/signup', signup);
router.post('/auth/google-signin', googleSignIn);

export default router;
