// ScingGPT - IPC Handlers

import type { IpcMain } from 'electron';
import type { SessionManager } from './session-manager';
import type { MCPBridge } from './mcp-bridge';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { APP_VERSION } from '../shared/constants';

interface Managers {
  sessionManager: SessionManager;
  mcpBridge: MCPBridge;
}

export function registerIpcHandlers(ipcMain: IpcMain, managers: Managers): void {
  const { sessionManager, mcpBridge } = managers;

  // Session handlers
  ipcMain.handle(IPC_CHANNELS.SESSION_CREATE, async () => {
    return sessionManager.createSession();
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_GET, async (_, id: string) => {
    return sessionManager.getSession(id);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_UPDATE, async (_, session) => {
    return sessionManager.updateSession(session);
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_LIST, async () => {
    return sessionManager.listSessions();
  });

  ipcMain.handle(IPC_CHANNELS.SESSION_DELETE, async (_, id: string) => {
    return sessionManager.deleteSession(id);
  });

  // Chat handlers
  ipcMain.handle(IPC_CHANNELS.CHAT_SEND, async (_event, message: string) => {
    try {
      const response = await mcpBridge.sendMessage(message);
      return { success: true, data: response };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: { code: 'CHAT_ERROR', message: err.message } };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAT_HISTORY, async (_, sessionId: string) => {
    return sessionManager.getChatHistory(sessionId);
  });

  ipcMain.handle(IPC_CHANNELS.CHAT_CLEAR, async (_, sessionId: string) => {
    return sessionManager.clearChatHistory(sessionId);
  });

  // MCP handlers
  ipcMain.handle(IPC_CHANNELS.MCP_CONNECT, async () => {
    try {
      await mcpBridge.connect();
      return { success: true };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: { code: 'MCP_CONNECT_ERROR', message: err.message } };
    }
  });

  ipcMain.handle(IPC_CHANNELS.MCP_DISCONNECT, async () => {
    await mcpBridge.disconnect();
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.MCP_EXECUTE, async (_, tool: string, args: Record<string, unknown>) => {
    try {
      const result = await mcpBridge.executeTool(tool, args);
      return { success: true, data: result };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: { code: 'MCP_EXECUTE_ERROR', message: err.message } };
    }
  });

  ipcMain.handle(IPC_CHANNELS.MCP_LIST_TOOLS, async () => {
    return mcpBridge.listTools();
  });

  ipcMain.handle(IPC_CHANNELS.MCP_STATUS, async () => {
    return mcpBridge.getStatus();
  });

  // Config handlers
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, async () => {
    return sessionManager.getConfig();
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET, async (_, config) => {
    return sessionManager.setConfig(config);
  });

  // App info
  ipcMain.handle(IPC_CHANNELS.APP_VERSION, () => {
    return APP_VERSION;
  });
}
