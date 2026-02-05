declare module 'firebase/app' {
	export type FirebaseApp = unknown;
	export function initializeApp(config: unknown): FirebaseApp;
}

declare module 'firebase/auth' {
	import type { FirebaseApp } from 'firebase/app';

	export interface Auth {
		currentUser?: User | null;
	}
	export type User = { uid: string } & Record<string, unknown>;
	export type Unsubscribe = () => void;

	export class GoogleAuthProvider {}

	export function getAuth(app?: FirebaseApp): Auth;
	export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{ user: User }>;
	export function signOut(auth: Auth): Promise<void>;
	export function onAuthStateChanged(auth: Auth, next: (user: User | null) => void): Unsubscribe;
	export function signInWithPopup(auth: Auth, provider: GoogleAuthProvider): Promise<{ user: User }>;
}

declare module 'firebase/firestore' {
	import type { FirebaseApp } from 'firebase/app';

	export type Firestore = unknown;
	export type Unsubscribe = () => void;
	export type DocumentData = Record<string, unknown>;
	export type QueryDocumentSnapshot<T = DocumentData> = { id: string; data: () => T };
	export type DocumentSnapshot<T = DocumentData> = { id: string; exists: () => boolean; data: () => T };
	export type Timestamp = { toDate: () => Date };

	export function getFirestore(app?: FirebaseApp): Firestore;
	export function collection(db: Firestore, path: string): unknown;
	export function doc(db: Firestore, path: string, id?: string): unknown;
	export function getDoc(reference: unknown): Promise<DocumentSnapshot>;
	export function setDoc(reference: unknown, data: unknown): Promise<void>;
	export function updateDoc(reference: unknown, data: unknown): Promise<void>;
	export function query(...args: unknown[]): unknown;
	export function where(field: string, op: string, value: unknown): unknown;
	export function orderBy(field: string, direction?: string): unknown;
	export function getDocs(query: unknown): Promise<{ docs: QueryDocumentSnapshot[] }>;
	export function onSnapshot(reference: unknown, callback: (snapshot: DocumentSnapshot) => void): Unsubscribe;
	export function serverTimestamp(): Timestamp;
}

declare module 'firebase/storage' {
	import type { FirebaseApp } from 'firebase/app';
	export type FirebaseStorage = unknown;
	export function getStorage(app?: FirebaseApp): FirebaseStorage;
}
