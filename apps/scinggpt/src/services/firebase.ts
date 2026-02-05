// ScingGPT - Firebase Service

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import type { FirebaseConfig, UserProfile, Session, ChatMessage } from '../shared/types';
import { COLLECTIONS } from '../shared/constants';

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private unsubscribers: Unsubscribe[] = [];

  /**
   * Initialize Firebase with config
   */
  initialize(config: FirebaseConfig): void {
    if (this.app) {
      console.warn('Firebase already initialized');
      return;
    }

    this.app = initializeApp(config);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const auth = this.auth as (Auth & { currentUser?: User | null }) | null;
    return auth?.currentUser ?? null;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthChange(callback: (user: User | null) => void): Unsubscribe {
    if (!this.auth) throw new Error('Firebase not initialized');
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    if (!this.auth) throw new Error('Firebase not initialized');
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    return result.user;
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    if (!this.auth) throw new Error('Firebase not initialized');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.auth) throw new Error('Firebase not initialized');
    await signOut(this.auth);
  }

  /**
   * Get user profile
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Firebase not initialized');
    const docRef = doc(this.db, COLLECTIONS.USERS, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as unknown as UserProfile) : null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, update: Partial<UserProfile>): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized');
    const docRef = doc(this.db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, {
      ...update,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Save session to Firestore
   */
  async saveSession(session: Session): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized');
    const docRef = doc(this.db, COLLECTIONS.SESSIONS, session.id);
    await setDoc(docRef, {
      ...session,
      createdAt: session.createdAt.toISOString(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Get sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    if (!this.db) throw new Error('Firebase not initialized');
    const q = query(
      collection(this.db, COLLECTIONS.SESSIONS),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data() as unknown as Session & { createdAt: string; updatedAt?: Timestamp };
      return {
        ...data,
        id: docSnap.id,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Session;
    });
  }

  /**
   * Subscribe to session changes
   */
  subscribeToSession(
    sessionId: string,
    callback: (session: Session | null) => void
  ): Unsubscribe {
    if (!this.db) throw new Error('Firebase not initialized');
    const docRef = doc(this.db, COLLECTIONS.SESSIONS, sessionId);
    const unsubscribe = onSnapshot(docRef, (snapshot: DocumentSnapshot<DocumentData>) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as unknown as Session & { createdAt: string; updatedAt?: Timestamp };
        callback({
          ...data,
          id: snapshot.id,
          createdAt: new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Session);
      } else {
        callback(null);
      }
    });
    this.unsubscribers.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Save chat message
   */
  async saveMessage(message: ChatMessage): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized');
    const docRef = doc(this.db, COLLECTIONS.MESSAGES, message.id);
    await setDoc(docRef, {
      ...message,
      timestamp: message.timestamp.toISOString(),
    });
  }

  /**
   * Get messages for a session
   */
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    if (!this.db) throw new Error('Firebase not initialized');
    const q = query(
      collection(this.db, COLLECTIONS.MESSAGES),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data() as unknown as ChatMessage & { timestamp: string };
      return {
        ...data,
        id: docSnap.id,
        timestamp: new Date(data.timestamp),
      } as ChatMessage;
    });
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
