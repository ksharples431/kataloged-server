import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import addRequestId from 'express-request-id';

import {
  errorMiddleware,
  notFound,
} from './middleware/errorMiddleware.js';
import {
  apiLimiter,
  authLimiter,
} from './middleware/rateLimitMiddleware.js';
import { handleAsyncRoute } from './errors/errorUtils.js';
import { requestLoggingMiddleware } from './middleware/requestLoggingMiddleware.js';
import { logEntry } from './config/cloudLoggingConfig.js';
import frontendErrorRoute from './errors/frontendErrors.js';
import authRoutes from './modules/auth/authRoutes.js';
import bookRoutes from './modules/books/bookRoutes.js';
import userRoutes from './modules/users/userRoutes.js';
import genreRoutes from './modules/genres/genreRoutes.js';
import authorRoutes from './modules/authors/authorRoutes.js';
import userBookRoutes from './modules/userBooks/userBookRoutes.js';
import userGenreRoutes from './modules/userGenres/userGenreRoutes.js';
import userAuthorRoutes from './modules/userAuthors/userAuthorRoutes.js';

dotenv.config();

const app = express();

app.use(addRequestId());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ['https://kataloged.com', 'http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.options('*', cors());

// Apply middleware
app.use(requestLoggingMiddleware);
app.use(apiLimiter);

// Apply more stringent rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Log incoming requests
app.use(
  handleAsyncRoute(async (req, res, next) => {
    await logEntry({
      severity: 'INFO',
      message: `Incoming request: ${req.method} ${req.url}`,
      requestId: req.id,
    });
    next();
  })
);

// Routes
app.use('/api', authRoutes);
app.use('/api', authorRoutes);
app.use('/api', bookRoutes);
app.use('/api', genreRoutes);
app.use('/api', userAuthorRoutes);
app.use('/api', userBookRoutes);
app.use('/api', userGenreRoutes);
app.use('/api', userRoutes);
app.use('/api', frontendErrorRoute);

// Error handling
app.use(notFound);
app.use(errorMiddleware);

export default app;
