
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp;

// This function ensures that we initialize the app only once
function getFirebaseApp(): FirebaseApp {
    if (getApps().length) {
        return getApp();
    }

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    };
    
    if (!firebaseConfig.apiKey) {
        throw new Error('Firebase API key is not configured. Please check your .env file.');
    }
    
    app = initializeApp(firebaseConfig);
    return app;
}

const db: Firestore = getFirestore(getFirebaseApp());
const auth: Auth = getAuth(getFirebaseApp());
const functions: Functions = getFunctions(getFirebaseApp());

// Exporting getter functions can be a safer way in some module-bundling scenarios
const getDb = () => getFirestore(getFirebaseApp());

export { db, auth, functions, getDb, getFirebaseApp };
