import express from 'express';

import {
  getGenres,
  getBooksByGenre,
} from './genreController.js';

const router = express.Router();

router.get('/genres', getGenres);
router.get('/genres/:genre/books', getBooksByGenre);

export default router;