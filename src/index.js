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
  'http://localhost:5173',
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

app.options('*', cors(corsOptions));

app.use(cors(corsOptions));


app.use('/api', bookRoutes);
app.use('/api', userRoutes);
app.use('/api', userBookRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

app.use(notFound);
app.use(errorHandler);

export default app;
