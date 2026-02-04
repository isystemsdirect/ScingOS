// ScingGPT - MCP Hook

import { useState, useCallback, useEffect } from 'react';

interface MCPStatus {
  connected: boolean;
  toolCount: number;
}

interface ToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface UseMCPReturn {
  status: MCPStatus;
  tools: ToolInfo[];
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  execute: (tool: string, args: Record<string, unknown>) => Promise<unknown>;
  refreshTools: () => Promise<void>;
}

export function useMCP(): UseMCPReturn {
  const [status, setStatus] = useState<MCPStatus>({ connected: false, toolCount: 0 });
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const currentStatus = await window.scinggpt.mcp.getStatus();
      setStatus(currentStatus);
      if (currentStatus.connected) {
        await refreshTools();
      }
    } catch (err) {
      // MCP not connected yet
    }
  };

  const connect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.scinggpt.mcp.connect();
      const typedResult = result as { success: boolean; error?: { message: string } };
      
      if (typedResult.success) {
        const currentStatus = await window.scinggpt.mcp.getStatus();
        setStatus(currentStatus);
        await refreshTools();
      } else if (typedResult.error) {
        setError(typedResult.error.message);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await window.scinggpt.mcp.disconnect();
      setStatus({ connected: false, toolCount: 0 });
      setTools([]);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const execute = useCallback(async (
    tool: string,
    args: Record<string, unknown>
  ): Promise<unknown> => {
    if (!status.connected) {
      throw new Error('MCP not connected');
    }

    try {
      const result = await window.scinggpt.mcp.execute(tool, args);
      const typedResult = result as { success: boolean; data?: unknown; error?: { message: string } };
      
      if (typedResult.success) {
        return typedResult.data;
      } else if (typedResult.error) {
        throw new Error(typedResult.error.message);
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [status.connected]);

  const refreshTools = useCallback(async (): Promise<void> => {
    try {
      const toolList = await window.scinggpt.mcp.listTools();
      setTools(toolList as ToolInfo[]);
      setStatus((prev) => ({ ...prev, toolCount: toolList.length }));
    } catch (err) {
      console.error('Failed to refresh tools:', err);
    }
  }, []);

  return {
    status,
    tools,
    isLoading,
    error,
    connect,
    disconnect,
    execute,
    refreshTools,
  };
}
