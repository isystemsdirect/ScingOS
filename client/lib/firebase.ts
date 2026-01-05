import { getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isBrowser = typeof window !== 'undefined';
const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

export const firebaseConfigured = hasFirebaseConfig;

// Avoid initializing Firebase during SSR/build when env is missing/invalid.
// This prevents hard crashes that can present as a white screen.
const app: FirebaseApp | null = (() => {
  const existing = getApps()[0];
  if (existing) return existing;
  if (!hasFirebaseConfig) return null;
  return initializeApp(firebaseConfig);
})();

export const auth: Auth | null = isBrowser && app ? getAuth(app) : null;
export const firestore: Firestore | null = isBrowser && app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = isBrowser && app ? getStorage(app) : null;

export default app;