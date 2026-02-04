// ScingGPT - Preload Script

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';

/**
 * Expose safe APIs to the renderer process
 */
contextBridge.exposeInMainWorld('scinggpt', {
  // Session API
  session: {
    create: () => ipcRenderer.invoke(IPC_CHANNELS.SESSION_CREATE),
    get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SESSION_GET, id),
    update: (session: unknown) => ipcRenderer.invoke(IPC_CHANNELS.SESSION_UPDATE, session),
    list: () => ipcRenderer.invoke(IPC_CHANNELS.SESSION_LIST),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SESSION_DELETE, id),
  },

  // Chat API
  chat: {
    send: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.CHAT_SEND, message),
    getHistory: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.CHAT_HISTORY, sessionId),
    clear: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.CHAT_CLEAR, sessionId),
    onMessage: (callback: (message: unknown) => void) => {
      ipcRenderer.on(IPC_CHANNELS.CHAT_STREAM, (_, message) => callback(message));
    },
    offMessage: () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.CHAT_STREAM);
    },
  },

  // MCP API
  mcp: {
    connect: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_CONNECT),
    disconnect: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_DISCONNECT),
    execute: (tool: string, args: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.MCP_EXECUTE, tool, args),
    listTools: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_LIST_TOOLS),
    getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_STATUS),
  },

  // Voice API
  voice: {
    start: () => ipcRenderer.send(IPC_CHANNELS.VOICE_START),
    stop: () => ipcRenderer.send(IPC_CHANNELS.VOICE_STOP),
    onTranscript: (callback: (transcript: string) => void) => {
      ipcRenderer.on(IPC_CHANNELS.VOICE_TRANSCRIPT, (_, transcript) => callback(transcript));
    },
    onState: (callback: (state: unknown) => void) => {
      ipcRenderer.on(IPC_CHANNELS.VOICE_STATE, (_, state) => callback(state));
    },
    offTranscript: () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.VOICE_TRANSCRIPT);
    },
    offState: () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.VOICE_STATE);
    },
  },

  // Config API
  config: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),
    set: (config: unknown) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET, config),
  },

  // Window API
  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  },

  // App API
  app: {
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_VERSION),
    quit: () => ipcRenderer.send(IPC_CHANNELS.APP_QUIT),
    onReady: (callback: () => void) => {
      ipcRenderer.on(IPC_CHANNELS.APP_READY, callback);
    },
    onError: (callback: (error: { code: string; message: string }) => void) => {
      ipcRenderer.on(IPC_CHANNELS.ERROR, (_, error) => callback(error));
    },
  },
});

// Type declaration for the exposed API
declare global {
  interface Window {
    scinggpt: {
      session: {
        create: () => Promise<unknown>;
        get: (id: string) => Promise<unknown>;
        update: (session: unknown) => Promise<unknown>;
        list: () => Promise<unknown[]>;
        delete: (id: string) => Promise<boolean>;
      };
      chat: {
        send: (message: string) => Promise<unknown>;
        getHistory: (sessionId: string) => Promise<unknown[]>;
        clear: (sessionId: string) => Promise<void>;
        onMessage: (callback: (message: unknown) => void) => void;
        offMessage: () => void;
      };
      mcp: {
        connect: () => Promise<unknown>;
        disconnect: () => Promise<unknown>;
        execute: (tool: string, args: Record<string, unknown>) => Promise<unknown>;
        listTools: () => Promise<unknown[]>;
        getStatus: () => Promise<{ connected: boolean; toolCount: number }>;
      };
      voice: {
        start: () => void;
        stop: () => void;
        onTranscript: (callback: (transcript: string) => void) => void;
        onState: (callback: (state: unknown) => void) => void;
        offTranscript: () => void;
        offState: () => void;
      };
      config: {
        get: () => Promise<unknown>;
        set: (config: unknown) => Promise<void>;
      };
      window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
      app: {
        getVersion: () => Promise<string>;
        quit: () => void;
        onReady: (callback: () => void) => void;
        onError: (callback: (error: { code: string; message: string }) => void) => void;
      };
    };
  }
}
