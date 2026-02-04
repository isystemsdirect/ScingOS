// ScingGPT - Shared Types

/**
 * Session state for ScingGPT interactions
 */
export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: SessionStatus;
  metadata: SessionMetadata;
}

export type SessionStatus = 'active' | 'paused' | 'completed' | 'expired';

export interface SessionMetadata {
  deviceId: string;
  platform: 'windows' | 'macos' | 'linux';
  appVersion: string;
  voiceEnabled: boolean;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  voiceInput?: boolean;
  toolCalls?: ToolCall[];
  tokens?: {
    prompt: number;
    completion: number;
  };
  latencyMs?: number;
}

/**
 * MCP Tool execution
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

/**
 * Voice recognition state
 */
export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  id: string;
  type: 'stdio' | 'http';
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
}

/**
 * App configuration
 */
export interface AppConfig {
  version: string;
  firebase: FirebaseConfig;
  openai: OpenAIConfig;
  anthropic: AnthropicConfig;
  mcp: MCPConfig;
  voice: VoiceConfig;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AnthropicConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface MCPConfig {
  servers: MCPServerConfig[];
  defaultServer: string;
}

export interface VoiceConfig {
  enabled: boolean;
  wakeWord: string;
  language: string;
  continuous: boolean;
}

/**
 * User profile from Firebase
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'inspector' | 'admin' | 'superadmin';
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  voiceEnabled: boolean;
  notifications: boolean;
  defaultModel: 'openai' | 'anthropic';
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * Electron IPC Events
 */
export type IPCMainEvents = {
  'session:create': () => Promise<Session>;
  'session:get': (id: string) => Promise<Session | null>;
  'session:update': (session: Partial<Session>) => Promise<void>;
  'chat:send': (message: string) => Promise<ChatMessage>;
  'mcp:execute': (tool: string, args: Record<string, unknown>) => Promise<unknown>;
  'voice:start': () => void;
  'voice:stop': () => void;
  'config:get': () => Promise<AppConfig>;
  'config:set': (config: Partial<AppConfig>) => Promise<void>;
};

export type IPCRendererEvents = {
  'session:updated': (session: Session) => void;
  'chat:message': (message: ChatMessage) => void;
  'chat:stream': (chunk: string) => void;
  'mcp:result': (result: ToolCall) => void;
  'voice:transcript': (transcript: string) => void;
  'voice:state': (state: VoiceState) => void;
  'error': (error: { code: string; message: string }) => void;
};
