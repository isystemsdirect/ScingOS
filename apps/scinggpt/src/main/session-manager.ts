// ScingGPT - Session Manager

import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import type { Session, ChatMessage, AppConfig, UserPreferences } from '../shared/types';

interface StoreSchema {
  sessions: Record<string, Session>;
  currentSessionId: string | null;
  chatHistory: Record<string, ChatMessage[]>;
  config: Partial<AppConfig>;
  preferences: UserPreferences;
}

export class SessionManager {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'scinggpt-sessions',
      defaults: {
        sessions: {},
        currentSessionId: null,
        chatHistory: {},
        config: {},
        preferences: {
          theme: 'dark',
          voiceEnabled: true,
          notifications: true,
          defaultModel: 'openai',
        },
      },
    });
  }

  /**
   * Create a new session
   */
  async createSession(): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      userId: 'local', // Will be replaced with Firebase UID
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      metadata: {
        deviceId: this.getDeviceId(),
        platform: this.getPlatform(),
        appVersion: '0.1.0',
        voiceEnabled: this.store.get('preferences.voiceEnabled', true),
      },
    };

    const sessions = this.store.get('sessions', {});
    sessions[session.id] = session;
    this.store.set('sessions', sessions);
    this.store.set('currentSessionId', session.id);

    // Initialize empty chat history for this session
    const chatHistory = this.store.get('chatHistory', {});
    chatHistory[session.id] = [];
    this.store.set('chatHistory', chatHistory);

    return session;
  }

  /**
   * Get a session by ID
   */
  async getSession(id: string): Promise<Session | null> {
    const sessions = this.store.get('sessions', {});
    return sessions[id] || null;
  }

  /**
   * Get current active session
   */
  async getCurrentSession(): Promise<Session | null> {
    const currentId = this.store.get('currentSessionId');
    if (!currentId) return null;
    return this.getSession(currentId);
  }

  /**
   * Update session
   */
  async updateSession(update: Partial<Session> & { id: string }): Promise<Session | null> {
    const sessions = this.store.get('sessions', {});
    const session = sessions[update.id];
    if (!session) return null;

    const updated: Session = {
      ...session,
      ...update,
      updatedAt: new Date(),
    };
    sessions[update.id] = updated;
    this.store.set('sessions', sessions);

    return updated;
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<Session[]> {
    const sessions = this.store.get('sessions', {});
    return Object.values(sessions).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Delete a session
   */
  async deleteSession(id: string): Promise<boolean> {
    const sessions = this.store.get('sessions', {});
    if (!sessions[id]) return false;

    delete sessions[id];
    this.store.set('sessions', sessions);

    // Also delete chat history
    const chatHistory = this.store.get('chatHistory', {});
    delete chatHistory[id];
    this.store.set('chatHistory', chatHistory);

    // Clear current session if it was deleted
    if (this.store.get('currentSessionId') === id) {
      this.store.set('currentSessionId', null);
    }

    return true;
  }

  /**
   * Add a message to session chat history
   */
  async addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    const chatHistory = this.store.get('chatHistory', {});
    if (!chatHistory[sessionId]) {
      chatHistory[sessionId] = [];
    }
    chatHistory[sessionId].push(chatMessage);
    this.store.set('chatHistory', chatHistory);

    // Update session timestamp
    await this.updateSession({ id: sessionId });

    return chatMessage;
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const chatHistory = this.store.get('chatHistory', {});
    return chatHistory[sessionId] || [];
  }

  /**
   * Clear chat history for a session
   */
  async clearChatHistory(sessionId: string): Promise<void> {
    const chatHistory = this.store.get('chatHistory', {});
    chatHistory[sessionId] = [];
    this.store.set('chatHistory', chatHistory);
  }

  /**
   * Get app configuration
   */
  async getConfig(): Promise<Partial<AppConfig>> {
    return this.store.get('config', {});
  }

  /**
   * Set app configuration
   */
  async setConfig(config: Partial<AppConfig>): Promise<void> {
    const current = this.store.get('config', {});
    this.store.set('config', { ...current, ...config });
  }

  /**
   * Save state (called on app close)
   */
  async saveState(): Promise<void> {
    // Mark current session as paused
    const currentId = this.store.get('currentSessionId');
    if (currentId) {
      await this.updateSession({ id: currentId, status: 'paused' });
    }
  }

  private getDeviceId(): string {
    let deviceId = this.store.get('deviceId' as keyof StoreSchema) as string | undefined;
    if (!deviceId) {
      deviceId = uuidv4();
      this.store.set('deviceId' as keyof StoreSchema, deviceId as never);
    }
    return deviceId;
  }

  private getPlatform(): 'windows' | 'macos' | 'linux' {
    switch (process.platform) {
      case 'win32':
        return 'windows';
      case 'darwin':
        return 'macos';
      default:
        return 'linux';
    }
  }
}
