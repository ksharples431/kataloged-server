import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import addRequestId from 'express-request-id';
import {
  globalErrorHandler,
  notFoundHandler,
  apiLimiter,
  authLimiter,
  requestLoggingMiddleware, // Import requestLoggingMiddleware from errorMiddleware.js
} from './middleware/errorMiddleware.js';
import { logEntry } from './config/cloudLoggingConfig.js';
import authRoutes from './modules/auth/authRoutes.js';
import bookRoutes from './modules/books/bookRoutes.js';
import userRoutes from './modules/users/userRoutes.js';
import genreRoutes from './modules/genres/genreRoutes.js';
import authorRoutes from './modules/authors/authorRoutes.js';
import userBookRoutes from './modules/userBooks/userBookRoutes.js';
import userGenreRoutes from './modules/userGenres/userGenreRoutes.js';
import userAuthorRoutes from './modules/userAuthors/userAuthorRoutes.js';
import searchRoutes from './modules/search/searchRoutes.js';
import { logFrontendError } from './errors/errorLogging.js';

dotenv.config();

const app = express();

app.use(addRequestId());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ['https://kataloged.com', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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

// Apply logging and rate limiting middleware
app.use(requestLoggingMiddleware); // Apply request logging
app.use(apiLimiter);
app.use('/api/auth', authLimiter);

// Log incoming requests
app.use(async (req, res, next) => {
  await logEntry({
    severity: 'INFO',
    message: `Incoming request: ${req.method} ${req.url}`,
    requestId: req.id,
  });
  next();
});

// Route handling
app.post('/api/logFrontendError', logFrontendError);
app.use('/api', authRoutes);
app.use('/api', authorRoutes);
app.use('/api', bookRoutes);
app.use('/api', genreRoutes);
app.use('/api', userAuthorRoutes);
app.use('/api', userBookRoutes);
app.use('/api', userGenreRoutes);
app.use('/api', userRoutes);
app.use('/api', searchRoutes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
