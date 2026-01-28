/**
 * Receive Pipeline
 * 
 * Listens to incoming messages from Firestore, downloads from Storage,
 * and stores in local history.
 * SpectroCAP™ Phase 1 — Windows Tauri Client
 */

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { ref, getBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { addToHistory, HistoryEntry } from './historyStore';

const LAST_RECEIVED_KEY = 'spectrocap.lastReceivedAt';

/**
 * Message document structure (matches Lane 3 Firestore schema)
 */
export interface MessageDoc {
  messageId: string;
  senderDeviceId: string;
  type: 'text'; // Phase 1 only
  createdAt: Timestamp;
  recipients: 'all' | string[];
  storagePath: string;
  mime: 'text/plain';
  sizeBytes: number;
}

/**
 * Download text from Cloud Storage
 */
async function downloadMessageText(storagePath: string): Promise<string> {
  try {
    const fileRef = ref(storage, storagePath);
    const bytes = await getBytes(fileRef);
    const text = new TextDecoder().decode(bytes);
    return text;
  } catch (error) {
    console.error(`Failed to download ${storagePath}:`, error);
    throw error;
  }
}

/**
 * Subscribe to incoming messages
 * Filters by createdAt > lastReceivedAt to avoid reprocessing
 */
export function subscribeToMessages(
  uid: string,
  onNewMessage?: (entry: HistoryEntry) => void
): () => void {
  const messagesCollection = collection(db, `users/${uid}/messages`);
  const lastReceivedStr = localStorage.getItem(LAST_RECEIVED_KEY);
  const lastReceivedMs = lastReceivedStr ? parseInt(lastReceivedStr, 10) : 0;

  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc'),
    limit(50),
  ];

  // Only fetch messages newer than last received (to avoid reprocessing)
  if (lastReceivedMs > 0) {
    const lastReceivedTimestamp = new Timestamp(Math.floor(lastReceivedMs / 1000), (lastReceivedMs % 1000) * 1000000);
    constraints.unshift(where('createdAt', '>', lastReceivedTimestamp));
  }

  const q = query(messagesCollection, ...constraints);

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    for (const docSnap of snapshot.docs) {
      const messageDoc = docSnap.data() as MessageDoc;

      try {
        // Download text from Storage
        const text = await downloadMessageText(messageDoc.storagePath);

        // Create history entry
        const entry: HistoryEntry = {
          id: messageDoc.messageId,
          createdAt: messageDoc.createdAt.toMillis(),
          text,
          senderDeviceId: messageDoc.senderDeviceId,
        };

        // Add to local history
        addToHistory(entry);

        // Update lastReceivedAt
        localStorage.setItem(LAST_RECEIVED_KEY, String(entry.createdAt));

        // Callback for UI update
        if (onNewMessage) {
          onNewMessage(entry);
        }
      } catch (error) {
        console.error(`Failed to process message ${messageDoc.messageId}:`, error);
      }
    }
  });

  return unsubscribe;
}
