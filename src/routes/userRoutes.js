import express from 'express';
import {
  googleSignIn,
  signupUser,
  loginUser
  // getUser,
  // updateUser,
  // deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/google-signin', googleSignIn);
router.post('/signup', signupUser);
router.get('/login', loginUser);

// router.get('/:uid', getUser);
// router.patch('/:uid', updateUser);
// router.delete('/:uid', deleteUser);

export default router;
