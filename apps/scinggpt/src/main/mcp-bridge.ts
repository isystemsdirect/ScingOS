// ScingGPT - MCP Bridge

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { MCP_PATHS } from '../shared/constants';

interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface ToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export class MCPBridge extends EventEmitter {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }>();
  private buffer = '';
  private connected = false;
  private tools: ToolInfo[] = [];

  constructor() {
    super();
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.process = spawn('node', [MCP_PATHS.SCINGGPT_SERVER], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            NODE_OPTIONS: '--enable-source-maps',
          },
        });

        this.process.stdout?.on('data', (data: Buffer) => {
          this.handleData(data);
        });

        this.process.stderr?.on('data', (data: Buffer) => {
          console.error('[MCP stderr]', data.toString());
        });

        this.process.on('error', (error) => {
          this.connected = false;
          this.emit('error', error);
          reject(error);
        });

        this.process.on('exit', (code) => {
          this.connected = false;
          this.emit('disconnected', code);
        });

        // Initialize the connection
        this.initialize()
          .then(() => {
            this.connected = true;
            this.emit('connected');
            resolve();
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }

  /**
   * Initialize the MCP connection
   */
  private async initialize(): Promise<void> {
    // Send initialize request
    const initResult = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: true },
        sampling: {},
      },
      clientInfo: {
        name: 'ScingGPT',
        version: '0.1.0',
      },
    });

    // Send initialized notification
    await this.sendNotification('notifications/initialized', {});

    // Get available tools
    const toolsResult = await this.sendRequest('tools/list', {}) as { tools: ToolInfo[] };
    this.tools = toolsResult.tools || [];
  }

  /**
   * Send a message through the MCP bridge
   */
  async sendMessage(message: string): Promise<unknown> {
    if (!this.connected) {
      throw new Error('MCP server not connected');
    }

    // This would typically route to the appropriate tool
    // For now, we'll use a chat-like tool if available
    const chatTool = this.tools.find(t => 
      t.name.includes('chat') || t.name.includes('prompt') || t.name.includes('ask')
    );

    if (chatTool) {
      return this.executeTool(chatTool.name, { message });
    }

    // Fallback: return the message as-is (for testing)
    return { role: 'assistant', content: `Echo: ${message}` };
  }

  /**
   * Execute an MCP tool
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.connected) {
      throw new Error('MCP server not connected');
    }

    const result = await this.sendRequest('tools/call', {
      name,
      arguments: args,
    });

    return result;
  }

  /**
   * List available tools
   */
  listTools(): ToolInfo[] {
    return this.tools;
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; toolCount: number } {
    return {
      connected: this.connected,
      toolCount: this.tools.length,
    };
  }

  /**
   * Send a JSON-RPC request
   */
  private sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.process?.stdin) {
        reject(new Error('MCP process not available'));
        return;
      }

      const id = ++this.requestId;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });

      const message = JSON.stringify(request) + '\n';
      this.process.stdin.write(message);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 30000);
    });
  }

  /**
   * Send a JSON-RPC notification (no response expected)
   */
  private async sendNotification(method: string, params?: Record<string, unknown>): Promise<void> {
    if (!this.process?.stdin) {
      throw new Error('MCP process not available');
    }

    const notification = {
      jsonrpc: '2.0',
      method,
      params,
    };

    const message = JSON.stringify(notification) + '\n';
    this.process.stdin.write(message);
  }

  /**
   * Handle incoming data from the MCP server
   */
  private handleData(data: Buffer): void {
    this.buffer += data.toString();

    // Process complete JSON-RPC messages
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const response: MCPResponse = JSON.parse(line);
        
        if (response.id !== undefined) {
          const pending = this.pendingRequests.get(response.id);
          if (pending) {
            this.pendingRequests.delete(response.id);
            
            if (response.error) {
              pending.reject(new Error(response.error.message));
            } else {
              pending.resolve(response.result);
            }
          }
        } else {
          // Handle notifications from server
          this.emit('notification', response);
        }
      } catch (error) {
        console.error('[MCP parse error]', line, error);
      }
    }
  }
}
