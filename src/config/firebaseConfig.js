import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseAdminApp;
let firebaseClientApp;
let auth;

// console.log('Config:', config);
// console.log(
//   'Google Application Credentials:',
//   config.google.applicationCredentials
// );

// Initialize Firebase Admin SDK
async function initializeFirebaseAdmin() {
  if (config.server.env === 'production') {
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    try {
      const serviceAccountPath = config.google.applicationCredentials;


      if (!serviceAccountPath) {
        throw new Error('Service account path is undefined');
      }

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
  firebaseClientApp = initializeApp(config.firebase);
  auth = getAuth(firebaseClientApp);
}

await initializeFirebaseAdmin();
initializeFirebaseClient();

const db = getFirestore();
const adminAuth = admin.auth();

db.settings({ ignoreUndefinedProperties: true });

export default db;
export { admin, adminAuth, auth };
