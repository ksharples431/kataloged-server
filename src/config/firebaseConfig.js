import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseAdminApp;
let firebaseClientApp;
let auth;

// Initialize Firebase Admin SDK
async function initializeFirebaseAdmin() {
  if (process.env.NODE_ENV === 'production') {
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    try {
      const serviceAccountPath = join(
        __dirname,
        '../../serviceAccountKey.json'
      );
      const serviceAccount = JSON.parse(
        await readFile(serviceAccountPath, 'utf8')
      );

      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Error loading service account file:', error);
      throw error;
    }
  }
}

// Initialize Firebase Client SDK
function initializeFirebaseClient() {
  const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    // measurementId: process.env.FB_MEASUREMENT_ID,
  };

  firebaseClientApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseClientApp);
}

await initializeFirebaseAdmin();
initializeFirebaseClient();

const db = getFirestore();
const adminAuth = admin.auth()

export default db;
export { admin, adminAuth, auth };
