import { collection } from "firebase/firestore";
import { db } from "./firebaseServices";

export function sessionsCollectionRef() {
  return collection(db, "sessions");
}

export function sessionMessagesCollectionRef(sessionId: string) {
  return collection(db, "sessions", sessionId, "messages");
}

export function sessionRunsCollectionRef(sessionId: string) {
  return collection(db, "sessions", sessionId, "runs");
}
