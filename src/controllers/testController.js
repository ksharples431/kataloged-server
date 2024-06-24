import { db } from '../config/firebaseConfig.js';

const testController = {
  async checkDatabaseConnection(req, res) {
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
  },
};

export default testController;