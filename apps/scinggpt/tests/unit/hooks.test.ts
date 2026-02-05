// Unit tests for hooks

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useSession } from '@renderer/hooks/useSession';
import { useMCP } from '@renderer/hooks/useMCP';

describe('useSession hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with no session', async () => {
    const { result } = renderHook(() => useSession());
    
    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.sessions).toEqual([]);
  });

  it('should create a new session', async () => {
    const { result } = renderHook(() => useSession());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      const session = await result.current.createSession();
      expect(session).toBeDefined();
      expect(session?.id).toBe('test-session');
    });

    expect(result.current.session).toBeDefined();
  });

  it('should delete a session', async () => {
    const { result } = renderHook(() => useSession());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Create then delete
    await act(async () => {
      await result.current.createSession();
    });

    await act(async () => {
      const success = await result.current.deleteSession('test-session');
      expect(success).toBe(true);
    });
  });
});

describe('useMCP hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Provide default MCP implementation to avoid undefined access in hooks
    window.scinggpt = window.scinggpt ?? ({} as typeof window.scinggpt);
    window.scinggpt.mcp = {
      connect: vi.fn().mockResolvedValue({ success: true }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn(),
      getStatus: vi.fn().mockResolvedValue({ connected: false, toolCount: 0 }),
      listTools: vi.fn().mockResolvedValue([]),
    };
  });

  it('should start disconnected', async () => {
    const { result } = renderHook(() => useMCP());
    
    await waitFor(() => {
      expect(result.current.status.connected).toBe(false);
      expect(result.current.status.toolCount).toBe(0);
      expect(result.current.tools).toEqual([]);
    });
  });

  it('should connect to MCP server', async () => {
    // Mock successful connection
    window.scinggpt.mcp.connect = vi.fn().mockResolvedValue({ success: true });
    window.scinggpt.mcp.getStatus = vi.fn().mockResolvedValue({ connected: true, toolCount: 5 });
    window.scinggpt.mcp.listTools = vi.fn().mockResolvedValue([
      { name: 'test_tool_1', description: 'Test', inputSchema: {} },
      { name: 'test_tool_2', description: 'Test', inputSchema: {} },
      { name: 'test_tool_3', description: 'Test', inputSchema: {} },
      { name: 'test_tool_4', description: 'Test', inputSchema: {} },
      { name: 'test_tool_5', description: 'Test', inputSchema: {} },
    ]);

    const { result } = renderHook(() => useMCP());
    
    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.status.connected).toBe(true);
    expect(result.current.status.toolCount).toBe(5);
  });

  it('should handle connection errors', async () => {
    window.scinggpt.mcp.connect = vi.fn().mockResolvedValue({ 
      success: false, 
      error: { message: 'Connection failed' } 
    });

    const { result } = renderHook(() => useMCP());
    
    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe('Connection failed');
  });

  it('should disconnect from MCP server', async () => {
    const { result } = renderHook(() => useMCP());
    
    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.status.connected).toBe(false);
  });
});
