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
import { displayImage, MediaDisplayResult } from './media';

const LAST_RECEIVED_KEY = 'spectrocap.lastReceivedAt';

/**
 * Message document structure (matches Firestore schema)
 * Phase 2A: text messages only
 * Phase 2B: text or image messages
 */
export interface MessageDoc {
  messageId: string;
  senderDeviceId: string;
  type: 'text' | 'image'; // Phase 2A/2B
  createdAt: Timestamp;
  recipients: 'all' | string[];
  storagePath: string;
  mime: 'text/plain' | 'image/png' | 'image/jpeg';
  sizeBytes?: number;
  // Phase 2B image fields
  media?: {
    width: number;
    height: number;
    filename: string;
    ext: string;
  };
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
 * Download image from Cloud Storage
 */
async function downloadMessageImage(storagePath: string): Promise<Uint8Array> {
  try {
    const fileRef = ref(storage, storagePath);
    const bytes = await getBytes(fileRef);
    return new Uint8Array(bytes);
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
  onNewMessage?: (entry: HistoryEntry) => void,
  onNewImage?: (result: MediaDisplayResult) => void
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
        // Handle Phase 2A text messages
        if (messageDoc.type === 'text') {
          const text = await downloadMessageText(messageDoc.storagePath);
          const entry: HistoryEntry = {
            id: messageDoc.messageId,
            createdAt: messageDoc.createdAt.toMillis(),
            text,
            senderDeviceId: messageDoc.senderDeviceId,
          };

          addToHistory(entry);
          localStorage.setItem(LAST_RECEIVED_KEY, String(entry.createdAt));

          if (onNewMessage) {
            onNewMessage(entry);
          }
        }
        // Handle Phase 2B image messages
        else if (messageDoc.type === 'image') {
          const imageBytes = await downloadMessageImage(messageDoc.storagePath);
          
          const result: MediaDisplayResult = {
            imageBytes,
            messageId: messageDoc.messageId,
            senderDeviceId: messageDoc.senderDeviceId,
            messageType: 'image',
            mime: messageDoc.mime as 'image/png' | 'image/jpeg',
            width: messageDoc.media?.width,
            height: messageDoc.media?.height,
            filename: messageDoc.media?.filename,
          };

          // Update lastReceivedAt
          localStorage.setItem(LAST_RECEIVED_KEY, String(messageDoc.createdAt.toMillis()));

          // Display image (Phase 2B UI)
          await displayImage(result);

          // Callback for UI update
          if (onNewImage) {
            onNewImage(result);
          }
        }
      } catch (error) {
        console.error(`Failed to process message ${messageDoc.messageId}:`, error);
      }
    }
  });

  return unsubscribe;
}
