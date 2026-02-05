// Test setup file

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Electron IPC
const mockScinggpt = {
  session: {
    create: vi.fn().mockResolvedValue({ id: 'test-session', status: 'active' }),
    get: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(true),
  },
  chat: {
    send: vi.fn().mockResolvedValue({ success: true, data: { content: 'Test response' } }),
    getHistory: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
    onMessage: vi.fn(),
    offMessage: vi.fn(),
  },
  mcp: {
    connect: vi.fn().mockResolvedValue({ success: true }),
    disconnect: vi.fn().mockResolvedValue({ success: true }),
    execute: vi.fn().mockResolvedValue({ success: true, data: {} }),
    listTools: vi.fn().mockResolvedValue([]),
    getStatus: vi.fn().mockResolvedValue({ connected: false, toolCount: 0 }),
  },
  voice: {
    start: vi.fn(),
    stop: vi.fn(),
    onTranscript: vi.fn(),
    onState: vi.fn(),
    offTranscript: vi.fn(),
    offState: vi.fn(),
  },
  config: {
    get: vi.fn().mockResolvedValue({}),
    set: vi.fn().mockResolvedValue(undefined),
  },
  window: {
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
  },
  app: {
    getVersion: vi.fn().mockResolvedValue('0.1.0'),
    quit: vi.fn(),
    onReady: vi.fn(),
    onError: vi.fn(),
  },
};

// Add to global
Object.defineProperty(window, 'scinggpt', {
  value: mockScinggpt,
  writable: true,
});

// Mock SpeechRecognition
const mockSpeechRecognition = vi.fn().mockImplementation(() => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onstart: null,
  onend: null,
  onerror: null,
  onresult: null,
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
}));

Object.defineProperty(window, 'SpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true,
});

declare global {
  interface Window {
    scinggpt: Window['scinggpt'];
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export {};
