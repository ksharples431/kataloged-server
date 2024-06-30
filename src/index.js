import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import addRequestId from 'express-request-id'; 
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userBookRoutes from './routes/userBookRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { setHeaders } from './middleware/headersMiddleware.js';

dotenv.config();

const app = express();

app.use(addRequestId());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setHeaders);

const allowedOrigins = [
  'https://kataloged431-client.web.app',
  'https://localhost:5173',
  'https://kataloged.com/',
  'https://www.kataloged.com/',
  'http://kataloged431-client.web.app',
  'http://localhost:5173',
  'http://kataloged.com/',
  'http://www.kataloged.com/',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Enable preflight requests for all routes
app.options('*', cors(corsOptions));

// Use CORS middleware for all routes
app.use(cors(corsOptions));

// Add a custom middleware to set explicit headers
app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Methods',
    corsOptions.methods.join(', ')
  );
  res.header(
    'Access-Control-Allow-Headers',
    corsOptions.allowedHeaders.join(', ')
  );
  next();
});

app.use('/api', bookRoutes);
app.use('/api', userRoutes);
app.use('/api', userBookRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

app.use(notFound);
app.use(errorHandler);

export default app;
