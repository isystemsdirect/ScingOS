// Unit tests for shared constants and types

import { describe, it, expect } from 'vitest';
import {
  APP_NAME,
  APP_VERSION,
  DEFAULTS,
  MCP_PATHS,
  COLLECTIONS,
  STORAGE_KEYS,
  UI,
} from '@shared/constants';
import { IPC_CHANNELS } from '@shared/ipc-channels';

describe('Constants', () => {
  describe('App info', () => {
    it('should have correct app name', () => {
      expect(APP_NAME).toBe('ScingGPT');
    });

    it('should have version string', () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('DEFAULTS', () => {
    it('should have voice defaults', () => {
      expect(DEFAULTS.VOICE.WAKE_WORD).toBe('hey scing');
      expect(DEFAULTS.VOICE.LANGUAGE).toBe('en-US');
      expect(DEFAULTS.VOICE.CONTINUOUS).toBe(true);
    });

    it('should have OpenAI defaults', () => {
      expect(DEFAULTS.OPENAI.MODEL).toBeDefined();
      expect(DEFAULTS.OPENAI.MAX_TOKENS).toBeGreaterThan(0);
      expect(DEFAULTS.OPENAI.TEMPERATURE).toBeGreaterThanOrEqual(0);
      expect(DEFAULTS.OPENAI.TEMPERATURE).toBeLessThanOrEqual(2);
    });

    it('should have Anthropic defaults', () => {
      expect(DEFAULTS.ANTHROPIC.MODEL).toBeDefined();
      expect(DEFAULTS.ANTHROPIC.MAX_TOKENS).toBeGreaterThan(0);
    });

    it('should have session defaults', () => {
      expect(DEFAULTS.SESSION.TIMEOUT_MS).toBeGreaterThan(0);
      expect(DEFAULTS.SESSION.MAX_MESSAGES).toBeGreaterThan(0);
    });
  });

  describe('MCP_PATHS', () => {
    it('should have server path', () => {
      expect(MCP_PATHS.SCINGGPT_SERVER).toBeDefined();
      expect(MCP_PATHS.SCINGGPT_SERVER).toContain('scinggpt-mcp');
    });

    it('should have chat paths', () => {
      expect(MCP_PATHS.CHAT_ROOT).toBeDefined();
      expect(MCP_PATHS.CHAT_IN).toBeDefined();
      expect(MCP_PATHS.CHAT_OUT).toBeDefined();
    });
  });

  describe('COLLECTIONS', () => {
    it('should have all collection names', () => {
      expect(COLLECTIONS.USERS).toBe('users');
      expect(COLLECTIONS.SESSIONS).toBe('sessions');
      expect(COLLECTIONS.MESSAGES).toBe('messages');
      expect(COLLECTIONS.CONFIGS).toBe('configs');
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have prefixed keys', () => {
      expect(STORAGE_KEYS.SESSION_ID).toContain('scinggpt:');
      expect(STORAGE_KEYS.USER_PREFERENCES).toContain('scinggpt:');
      expect(STORAGE_KEYS.AUTH_TOKEN).toContain('scinggpt:');
      expect(STORAGE_KEYS.THEME).toContain('scinggpt:');
    });
  });

  describe('UI', () => {
    it('should have reasonable animation duration', () => {
      expect(UI.ANIMATION_DURATION).toBeGreaterThan(0);
      expect(UI.ANIMATION_DURATION).toBeLessThan(1000);
    });

    it('should have reasonable debounce time', () => {
      expect(UI.DEBOUNCE_MS).toBeGreaterThan(0);
      expect(UI.DEBOUNCE_MS).toBeLessThan(1000);
    });

    it('should have max message length', () => {
      expect(UI.MAX_MESSAGE_LENGTH).toBeGreaterThan(100);
    });
  });
});

describe('IPC Channels', () => {
  it('should have session channels', () => {
    expect(IPC_CHANNELS.SESSION_CREATE).toBe('session:create');
    expect(IPC_CHANNELS.SESSION_GET).toBe('session:get');
    expect(IPC_CHANNELS.SESSION_UPDATE).toBe('session:update');
    expect(IPC_CHANNELS.SESSION_LIST).toBe('session:list');
    expect(IPC_CHANNELS.SESSION_DELETE).toBe('session:delete');
  });

  it('should have chat channels', () => {
    expect(IPC_CHANNELS.CHAT_SEND).toBe('chat:send');
    expect(IPC_CHANNELS.CHAT_STREAM).toBe('chat:stream');
    expect(IPC_CHANNELS.CHAT_HISTORY).toBe('chat:history');
    expect(IPC_CHANNELS.CHAT_CLEAR).toBe('chat:clear');
  });

  it('should have MCP channels', () => {
    expect(IPC_CHANNELS.MCP_CONNECT).toBe('mcp:connect');
    expect(IPC_CHANNELS.MCP_DISCONNECT).toBe('mcp:disconnect');
    expect(IPC_CHANNELS.MCP_EXECUTE).toBe('mcp:execute');
    expect(IPC_CHANNELS.MCP_LIST_TOOLS).toBe('mcp:list-tools');
    expect(IPC_CHANNELS.MCP_STATUS).toBe('mcp:status');
  });

  it('should have voice channels', () => {
    expect(IPC_CHANNELS.VOICE_START).toBe('voice:start');
    expect(IPC_CHANNELS.VOICE_STOP).toBe('voice:stop');
    expect(IPC_CHANNELS.VOICE_TRANSCRIPT).toBe('voice:transcript');
    expect(IPC_CHANNELS.VOICE_STATE).toBe('voice:state');
  });
});
