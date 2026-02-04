// ScingGPT - Constants

export const APP_NAME = 'ScingGPT';
export const APP_VERSION = '0.1.0';

/**
 * Default configuration values
 */
export const DEFAULTS = {
  VOICE: {
    WAKE_WORD: 'hey scing',
    LANGUAGE: 'en-US',
    CONTINUOUS: true,
  },
  OPENAI: {
    MODEL: 'gpt-4-turbo',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7,
  },
  ANTHROPIC: {
    MODEL: 'claude-3-sonnet-20240229',
    MAX_TOKENS: 4096,
  },
  SESSION: {
    TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    MAX_MESSAGES: 100,
  },
} as const;

/**
 * MCP Server paths
 */
export const MCP_PATHS = {
  SCINGGPT_SERVER: 'G:/GIT/isystemsdirect/scinggpt-mcp/dist/server.js',
  SCINGOS_SERVER: 'mcp/server.mjs',
  CHAT_ROOT: '.spectroline/chat',
  CHAT_IN: '.spectroline/chat/in',
  CHAT_OUT: '.spectroline/chat/out',
} as const;

/**
 * Firebase collection names
 */
export const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  MESSAGES: 'messages',
  CONFIGS: 'configs',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  SESSION_ID: 'scinggpt:sessionId',
  USER_PREFERENCES: 'scinggpt:preferences',
  AUTH_TOKEN: 'scinggpt:authToken',
  THEME: 'scinggpt:theme',
} as const;

/**
 * UI Constants
 */
export const UI = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_MS: 300,
  MAX_MESSAGE_LENGTH: 10000,
  TOAST_DURATION: 3000,
} as const;
