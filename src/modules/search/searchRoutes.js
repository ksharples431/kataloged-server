import express from 'express';
import verifyToken from '../../middleware/tokenMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { asyncRouteHandler } from '../../errors/errorHandler.js';
import { apiLimiter } from '../../middleware/rateLimitMiddleware.js';
import {
  searchBookSchema,
  generalSearchSchema,
} from './searchModel.js';
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
  asyncRouteHandler(searchBook)
);
router.get(
  '/search/google-search',
  verifyToken,
  validateRequest(searchBookSchema, 'query'),
  asyncRouteHandler(searchGoogleBooks)
);
router.get(
  '/search/general-search',
  validateRequest(generalSearchSchema, 'query'),
  asyncRouteHandler(generalSearch)
);

export default router;