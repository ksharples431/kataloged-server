import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { handleAsyncRoute } from '../../errors/errorUtils.js';
import { authLimiter } from '../../middleware/rateLimitMiddleware.js';
import { login, logout, signup, googleSignIn } from './authController.js';

const router = express.Router();

router.use('/auth', authLimiter);

router.get('/auth/login', verifyToken, handleAsyncRoute(login));
router.post('/auth/logout', verifyToken, handleAsyncRoute(logout));
router.post('/auth/signup', handleAsyncRoute(signup));
router.post('/auth/google-signin', handleAsyncRoute(googleSignIn));

export default router;
