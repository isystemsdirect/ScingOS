// ScingGPT - IPC Channel Definitions

/**
 * IPC channels for communication between main and renderer processes
 */
export const IPC_CHANNELS = {
  // Session management
  SESSION_CREATE: 'session:create',
  SESSION_GET: 'session:get',
  SESSION_UPDATE: 'session:update',
  SESSION_LIST: 'session:list',
  SESSION_DELETE: 'session:delete',

  // Chat operations
  CHAT_SEND: 'chat:send',
  CHAT_STREAM: 'chat:stream',
  CHAT_HISTORY: 'chat:history',
  CHAT_CLEAR: 'chat:clear',

  // MCP operations
  MCP_CONNECT: 'mcp:connect',
  MCP_DISCONNECT: 'mcp:disconnect',
  MCP_EXECUTE: 'mcp:execute',
  MCP_LIST_TOOLS: 'mcp:list-tools',
  MCP_STATUS: 'mcp:status',

  // Voice operations
  VOICE_START: 'voice:start',
  VOICE_STOP: 'voice:stop',
  VOICE_TRANSCRIPT: 'voice:transcript',
  VOICE_STATE: 'voice:state',

  // Configuration
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_RESET: 'config:reset',

  // Authentication
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_STATE: 'auth:state',
  AUTH_TOKEN: 'auth:token',

  // Window operations
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  // System
  APP_VERSION: 'app:version',
  APP_QUIT: 'app:quit',
  APP_READY: 'app:ready',
  ERROR: 'error',
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
