import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseApp;

async function initializeFirebase() {
  if (process.env.NODE_ENV === 'production') {
    // Use application default credentials in production
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    // Use a service account file for local development
    try {
      const serviceAccountPath = join(
        __dirname,
        '../../serviceAccountKey.json'
      );
      const serviceAccount = JSON.parse(
        await readFile(serviceAccountPath, 'utf8')
      );

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Error loading service account file:', error);
      throw error;
    }
  }
}

await initializeFirebase();

const db = getFirestore();

export default db;
export { admin };
