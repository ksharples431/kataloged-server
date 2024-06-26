import express from 'express';
import { addBook } from '../controllers/bookController.js';

const router = express.Router();

router.post('/books', addBook);

export default router;
