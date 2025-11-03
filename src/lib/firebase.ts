
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let functions: Functions | undefined;

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
    if (typeof window === 'undefined') {
        return null;
    }
    if (app) return app;

    if (getApps().length > 0) {
        app = getApp();
        return app;
    }
    
    if (!firebaseConfig.apiKey) {
        console.error('Firebase API key is not configured. Please check your .env file.');
        return null;
    }
    
    app = initializeApp(firebaseConfig);
    return app;
}


function getFirebaseAuth(): Auth | null {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    if (auth) return auth;
    auth = getAuth(firebaseApp);
    return auth;
}

function getDb(): Firestore | null {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    if (db) return db;
    db = getFirestore(firebaseApp);
    return db;
}

function getFirebaseFunctions(): Functions | null {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    if (functions) return functions;
    functions = getFunctions(firebaseApp);
    return functions;
}

export { 
    getFirebaseApp, 
    getFirebaseAuth, 
    getDb, 
    getFirebaseFunctions 
};
