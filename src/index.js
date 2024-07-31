import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//todo see if this works
import addRequestId from 'express-request-id'; 
import authRoutes from './modules/auth/authRoutes.js';
import authorRoutes from './modules/authors/authorRoutes.js';
import bookRoutes from './modules/books/bookRoutes.js';
import genreRoutes from './modules/genres/genreRoutes.js';
import userAuthorRoutes from './modules/userAuthors/userAuthorRoutes.js';
import userBookRoutes from './modules/userBooks/userBookRoutes.js';
import userGenreRoutes from './modules/userGenres/userGenreRoutes.js';
import userRoutes from './modules/users/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { setHeaders } from './middleware/headersMiddleware.js';

//todo check on order of middleware items
dotenv.config();

const app = express();

app.use(addRequestId());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setHeaders);

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

app.use('/api', authRoutes);
app.use('/api', authorRoutes);
app.use('/api', bookRoutes);
app.use('/api', genreRoutes);
app.use('/api', userAuthorRoutes);
app.use('/api', userBookRoutes);
app.use('/api', userGenreRoutes);
app.use('/api', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
