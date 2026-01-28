/**
 * Shared types for SCINGULAR Remote Paste
 * Used by Android, Windows, and backend services
 */

export interface User {
  uid: string;
  email: string;
  createdAt: number;
  updatedAt: number;
}

export interface Device {
  deviceId: string;
  uid: string;
  platform: 'android' | 'windows';
  name: string;
  createdAt: number;
  lastSeenAt: number;
  status: 'active' | 'inactive';
}

export interface Message {
  messageId: string;
  uid: string;
  senderDeviceId: string;
  type: 'text' | 'image' | 'file'; // Phase 1: 'text' only
  createdAt: number;
  payloadRef: string; // gs://bucket/users/{uid}/messages/{messageId}.bin
  recipients: 'all' | string[]; // Phase 1: 'all' only
  size: number; // Payload size in bytes
  // Phase 2+
  nonce?: string; // For replay protection
  signature?: string; // Ed25519 signature (hex-encoded)
  keyEnvelopes?: Record<string, string>; // deviceId -> base64(encryptedDEK)
}

export interface LocalMessage extends Message {
  downloadedAt: number;
  isFavorite: boolean;
  isLast: boolean;
  // Local state (not synced)
  content?: string; // Decrypted content (Phase 1: plaintext)
}

export interface ClipboardEvent {
  messageId: string;
  content: string;
  timestamp: number;
}

// Firebase Request/Response types
export interface FirebaseError {
  code: string;
  message: string;
  userMessage?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: FirebaseError;
  user?: User;
}

export interface MessageResponse {
  success: boolean;
  error?: FirebaseError;
  message?: Message;
}

// Settings (local storage)
export interface LocalSettings {
  uid?: string;
  deviceId?: string;
  lastSyncAt?: number;
  theme?: 'light' | 'dark';
}
