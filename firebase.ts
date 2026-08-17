import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

let app: any;
let auth: any;
let db: any;
let googleProvider: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  googleProvider = new GoogleAuthProvider();
} catch (err) {
  console.error("Firebase initialization crashed, setting up fallback mocks:", err);
  app = null;
  auth = null;
  db = null;
  googleProvider = null;
}

export { app, auth, db, googleProvider };
export default app;
