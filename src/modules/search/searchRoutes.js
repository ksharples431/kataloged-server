import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { apiLimiter } from '../../middleware/errorMiddleware.js';
import { searchBookSchema, generalSearchSchema } from './searchModel.js';
import {
  searchBook,
  generalSearch,
  searchGoogleBooks,
} from './searchController.js';

const router = express.Router();

router.use('/search', apiLimiter);

router.get(
  '/search/db-search',
  verifyToken,
  validateRequest(searchBookSchema, 'query'),
  searchBook
);
router.get(
  '/search/google-search',
  verifyToken,
  validateRequest(searchBookSchema, 'query'),
  searchGoogleBooks
);
router.get(
  '/search/general-search',
  validateRequest(generalSearchSchema, 'query'),
  generalSearch
);

export default router;
