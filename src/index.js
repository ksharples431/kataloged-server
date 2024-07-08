import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import addRequestId from 'express-request-id'; 
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userBookRoutes from './routes/userBookRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { setHeaders } from './middleware/headersMiddleware.js';
import  verifyToken  from './middleware/authMiddleware.js';

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

// Enable pre-flight requests for all routes
app.options('*', cors());

// app.use('/api/users', verifyToken);
app.use('/api/userBooks', verifyToken);
app.use('/api/books', verifyToken);

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/userBooks', userBookRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

app.use(notFound);
app.use(errorHandler);

export default app;
