
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// This function ensures that we initialize the app only once
function getFirebaseApp(): FirebaseApp {
    if (!getApps().length) {
        if (!firebaseConfig.apiKey) {
            throw new Error('Firebase API key is not configured. Please check your .env file.');
        }
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

const app: FirebaseApp = getFirebaseApp();

// Getter functions for services to ensure app is initialized
function getDb(): Firestore {
    return getFirestore(getFirebaseApp());
}

function getFirebaseAuth(): Auth {
    return getAuth(getFirebaseApp());
}

function getFirebaseFunctions(): Functions {
    return getFunctions(getFirebaseApp());
}

const db = getDb();
const auth = getFirebaseAuth();
const functions = getFirebaseFunctions();


export { app, db, auth, functions, getDb };
