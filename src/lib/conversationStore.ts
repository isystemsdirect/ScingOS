import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

export interface ConversationMessage {
  id: string;
  sessionId: string;
  userId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
  audioTranscript?: string;
  confidence?: number;
  metadata?: {
    wakeWordDetected?: boolean;
    speechRecognitionConfidence?: number;
    responseTime?: number;
    model?: string;
  };
}

export interface ConversationSession {
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  messageCount: number;
  totalDuration?: number;
  context: {
    userProfile?: any;
    preferences?: any;
    scingularIntegration?: any;
  };
}

class ConversationStore {
  private conversationsCollection = collection(db, 'conversations');
  private sessionsCollection = collection(db, 'conversationSessions');

  async createSession(userId: string, context: any = {}): Promise<string> {
    const session = await addDoc(this.sessionsCollection, {
      userId,
      startTime: serverTimestamp(),
      messageCount: 0,
      context,
      createdAt: serverTimestamp()
    });
    
    return session.id;
  }

  async addMessage(
    sessionId: string, 
    userId: string, 
    type: 'user' | 'assistant' | 'system',
    content: string,
    metadata: any = {}
  ): Promise<string> {
    const message = await addDoc(this.conversationsCollection, {
      sessionId,
      userId,
      type,
      content,
      timestamp: serverTimestamp(),
      metadata,
      createdAt: serverTimestamp()
    });

    // Update session message count
    const sessionRef = doc(this.sessionsCollection, sessionId);
    const snapshot = await getCountFromServer(query(this.conversationsCollection));
    await updateDoc(sessionRef, {
      messageCount: snapshot.data().count,
      lastActivity: serverTimestamp()
    });

    return message.id;
  }

  subscribeToSession(
    sessionId: string, 
    callback: (messages: ConversationMessage[]) => void
  ): () => void {
    const q = query(
      this.conversationsCollection,
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: ConversationMessage[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.sessionId === sessionId) {
          messages.push({
            id: doc.id,
            ...data
          } as ConversationMessage);
        }
      });

      callback(messages);
    });
  }

  async endSession(sessionId: string): Promise<void> {
    const sessionRef = doc(this.sessionsCollection, sessionId);
    await updateDoc(sessionRef, {
      endTime: serverTimestamp(),
    });
  }
}

export const conversationStore = new ConversationStore();
