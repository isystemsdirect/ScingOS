// ScingGPT - MCP Client Service

import type { ToolCall } from '../shared/types';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

class MCPClientService {
  private connected = false;
  private tools: MCPTool[] = [];

  /**
   * Connect to MCP server via IPC bridge
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const result = await window.scinggpt.mcp.connect();
    const typedResult = result as { success: boolean; error?: { message: string } };
    
    if (!typedResult.success) {
      throw new Error(typedResult.error?.message || 'Failed to connect to MCP');
    }

    this.connected = true;
    await this.refreshTools();
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    await window.scinggpt.mcp.disconnect();
    this.connected = false;
    this.tools = [];
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get available tools
   */
  getTools(): MCPTool[] {
    return this.tools;
  }

  /**
   * Refresh tool list from server
   */
  async refreshTools(): Promise<void> {
    if (!this.connected) {
      throw new Error('MCP not connected');
    }

    const tools = await window.scinggpt.mcp.listTools();
    this.tools = tools as MCPTool[];
  }

  /**
   * Execute a tool
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.connected) {
      throw new Error('MCP not connected');
    }

    const result = await window.scinggpt.mcp.execute(name, args);
    const typedResult = result as { success: boolean; data?: unknown; error?: { message: string } };

    if (!typedResult.success) {
      throw new Error(typedResult.error?.message || 'Tool execution failed');
    }

    return typedResult.data;
  }

  /**
   * Find a tool by name
   */
  findTool(name: string): MCPTool | undefined {
    return this.tools.find((t) => t.name === name);
  }

  /**
   * Find tools by pattern
   */
  findToolsByPattern(pattern: string): MCPTool[] {
    const regex = new RegExp(pattern, 'i');
    return this.tools.filter((t) => regex.test(t.name) || regex.test(t.description));
  }

  /**
   * Get tool categories
   */
  getToolCategories(): Map<string, MCPTool[]> {
    const categories = new Map<string, MCPTool[]>();

    for (const tool of this.tools) {
      // Extract category from tool name (e.g., "repo_list" -> "repo")
      const category = tool.name.split('_')[0] || 'other';
      
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(tool);
    }

    return categories;
  }

  /**
   * Create a tool call record
   */
  createToolCall(name: string, args: Record<string, unknown>): ToolCall {
    return {
      id: `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      arguments: args,
      status: 'pending',
    };
  }

  /**
   * Execute a tool call and update its status
   */
  async executeToolCall(toolCall: ToolCall): Promise<ToolCall> {
    try {
      toolCall.status = 'running';
      const result = await this.executeTool(toolCall.name, toolCall.arguments);
      toolCall.result = result;
      toolCall.status = 'completed';
    } catch (error) {
      toolCall.status = 'failed';
      toolCall.error = (error as Error).message;
    }

    return toolCall;
  }

  /**
   * Get connection status details
   */
  async getStatus(): Promise<{ connected: boolean; toolCount: number }> {
    return window.scinggpt.mcp.getStatus();
  }
}

// Export singleton instance
export const mcpClient = new MCPClientService();
