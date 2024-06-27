import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import bodyParser from 'body-parser';
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userBookRoutes from './routes/userBookRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { setHeaders } from './middleware/headersMiddleware.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setHeaders);
app.use(
  cors({
    origin: [
      'https://kataloged431-client.web.app',
      'http://localhost:5173',
    ],
    credentials: true, // This is necessary for including credentials in the request
  })
);

// app.use(bodyParser.json());
app.use('/api', bookRoutes);
app.use('/api', userRoutes);
app.use('/api', userBookRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

app.use(notFound);
app.use(errorHandler);

export default app;
