import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testRoutes from './routes/testRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['https://cataloged-427221.web.app', 'http://localhost:5173'],
  })
);

app.use('/api', testRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

app.use(notFound);
app.use(errorHandler);

export default app;
