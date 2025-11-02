
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
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

function getFirebaseApp(): FirebaseApp {
    if (app) return app;

    if (getApps().length > 0) {
        app = getApp();
        return app;
    }

    if (!firebaseConfig.apiKey) {
        throw new Error('Firebase API key is not configured in next.config.js. Please check your configuration.');
    }
    
    app = initializeApp(firebaseConfig);
    return app;
}

function getFirebaseAuth(): Auth {
    if (auth) return auth;
    auth = getAuth(getFirebaseApp());
    return auth;
}

function getDb(): Firestore {
    if (db) return db;
    db = getFirestore(getFirebaseApp());
    return db;
}

function getFirebaseFunctions(): Functions {
    if (functions) return functions;
    functions = getFunctions(getFirebaseApp());
    return functions;
}

export { 
    getFirebaseApp, 
    getFirebaseAuth, 
    getDb, 
    getFirebaseFunctions 
};
