const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { getFirestore } = require('firebase-admin/firestore');
const {
  initializeApp,
  applicationDefault,
} = require('firebase-admin/app');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dotenv.config();

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

app.get('/db-test', async (req, res) => {
  try {
    // Attempt a simple database query (e.g., get a single document)
    const docRef = db.collection('test').doc('testDoc');
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      console.log('Database connection successful!');
      res.status(200).send('Database connection OK');
    } else {
      console.error('Document not found or database connection failed.');
      res.status(500).send('Database connection error');
    }
  } catch (error) {
    console.error('Error checking database connection:', error);
    res.status(500).send('Database connection error');
  }
});

app.get('/', (req, res) => {
  res.send('Hello from Cloud Run!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
