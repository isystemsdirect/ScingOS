
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import getConfig from 'next/config';

// A singleton pattern to ensure a single Firebase app instance
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;

function getFirebaseApp(): FirebaseApp {
    if (app) return app;

    const { publicRuntimeConfig } = getConfig();
    const firebaseConfig = publicRuntimeConfig.firebaseConfig;

    if (!firebaseConfig || !firebaseConfig.apiKey) {
        throw new Error('Firebase API key is not configured in next.config.js. Please check your configuration.');
    }
    
    if (getApps().length) {
        app = getApp();
    } else {
        app = initializeApp(firebaseConfig);
    }
    return app;
}

function getFirebaseAuth(): Auth {
    if (auth) return auth;
    auth = getAuth(getFirebaseApp());
    return auth;
}

function getFirebaseDb(): Firestore {
    if (db) return db;
    db = getFirestore(getFirebaseApp());
    return db;
}

function getFirebaseFunctions(): Functions {
    if (functions) return functions;
    functions = getFunctions(getFirebaseApp());
    return functions;
}

// Export getter functions to be used throughout the app
export { 
    getFirebaseApp, 
    getFirebaseAuth, 
    getFirebaseDb as getDb, 
    getFirebaseFunctions 
};

// Export individual instances for convenience, but getters are preferred
export const firebaseApp = getFirebaseApp();
export { auth, db, functions };
