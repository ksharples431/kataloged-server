import express from 'express';

import {
  getAuthors,
  getBooksByAuthor,
} from './authorController.js';

const router = express.Router();

router.get('/authors', getAuthors);
router.get('/authors/:author/books', getBooksByAuthor);

export default router;