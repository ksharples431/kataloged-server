import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bookRoutes from './routes/bookRoutes.js';
import testRoutes from './routes/testRoutes.js';
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


app.use('/api', bookRoutes);
app.use('/api', testRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

app.use(notFound);
app.use(errorHandler);

export default app;
