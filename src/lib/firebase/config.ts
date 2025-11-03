// lib/firebase/config.ts - Optimized Firebase initialization
import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert, type App as AdminApp } from 'firebase-admin/app';
import { getFirestore, type Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth';
import { getStorage, type Storage as AdminStorage } from 'firebase-admin/storage';

// Client-side Firebase config (optimized for bundle size)
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Server-side Firebase Admin initialization
let adminApp: AdminApp | undefined;
let adminDb: AdminFirestore | undefined;
let adminAuth: AdminAuth | undefined;
let adminStorage: AdminStorage | undefined;

if (typeof window === 'undefined') {
  // Server-side only
  try {
    if (!getAdminApps().length) {
      adminApp = initializeAdminApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      adminApp = getAdminApps()[0];
    }
    
    if (adminApp) {
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);
        adminStorage = getStorage(adminApp);
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Client-side Firebase initialization (lazy loaded)
let clientApp: FirebaseApp | undefined;
let clientDb: Firestore | undefined;
let clientAuth: Auth | undefined;

if (typeof window !== 'undefined') {
  // Client-side only
  if (!getApps().length) {
    if (firebaseConfig.apiKey) {
      clientApp = initializeApp(firebaseConfig);
    }
  } else {
    clientApp = getApp();
  }

  if (clientApp) {
    clientDb = getFirestore(clientApp);
    clientAuth = getAuth(clientApp);
  }
}

// Export unified interface
export {
  // Server-side exports
  adminApp,
  adminDb,
  adminAuth,
  adminStorage,
  // Client-side exports
  clientApp as app,
  clientDb as db,
  clientAuth as auth,
};

// Type-safe database reference helper
export const createDbRef = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return adminDb;
  } else {
    // Client-side
    return clientDb;
  }
};
