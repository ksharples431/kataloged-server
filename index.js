import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['https://cataloged-427221.web.app', 'http://localhost:5173'], 
  })
);

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

app.get('/db-test', async (req, res) => {
  try {
    const docRef = db.collection('test').doc('testDoc');
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      console.log('Database connection successful!');
      res.status(200).send('Database connection OK');
    } else {
      console.warn('Document not found in the test collection.');
      res.status(404).send('Document not found');
    }
  } catch (error) {
    console.error('Error checking database connection:', error.message);
    res.status(500).send('Database connection error');
  }
});

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening for HTTP requests on port ${PORT}`);
});
