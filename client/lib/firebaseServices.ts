import { firestore } from "./firebase";

// Minimal compatibility layer for code that expects a single Firestore handle named `db`.
// Note: `firestore` may be null when Firebase isn't configured or during SSR.
// Call sites must guard appropriately (e.g. via AuthContext `firebaseConfigured`).
export const db = firestore as any;
