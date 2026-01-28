/**
 * Anthropic Claude provider for SCINGULAR LARI engines.
 * Supports claude-3-5-haiku-20241022 and other Claude models.
 */

import type { EngineConfig } from '../engineRegistry';

export interface AnthropicClientOptions {
  apiKey?: string;
  baseURL?: string;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
  temperature?: number;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Anthropic provider client stub for local SDK initialization.
 * In production, use @anthropic-ai/sdk package.
 */
export class AnthropicProvider {
  private apiKey: string;
  private baseURL: string = 'https://api.anthropic.com/v1';

  constructor(opts: AnthropicClientOptions = {}) {
    this.apiKey = opts.apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (opts.baseURL) this.baseURL = opts.baseURL;

    if (!this.apiKey) {
      console.warn(
        'AnthropicProvider initialized without API key. Set ANTHROPIC_API_KEY env var.'
      );
    }
  }

  async createMessage(req: AnthropicRequest): Promise<AnthropicResponse> {
    // Stub for local development; real implementation uses @anthropic-ai/sdk
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };

    const body = JSON.stringify(req);

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `Anthropic API error (${response.status}): ${error}`
        );
      }

      return (await response.json()) as AnthropicResponse;
    } catch (error) {
      console.error('AnthropicProvider.createMessage failed:', error);
      throw error;
    }
  }
}

/**
 * Create a configured Anthropic provider instance.
 */
export function createAnthropicProvider(
  opts: AnthropicClientOptions = {}
): AnthropicProvider {
  return new AnthropicProvider(opts);
}

/**
 * Engine config factory for Claude-based engines.
 */
export function createClaudeEngineConfig(
  id: string,
  modelId: string,
  displayName: string,
  description: string
): EngineConfig {
  return {
    id,
    family: 'provider',
    displayName,
    description,
    provider: 'internal', // Route via internal Anthropic provider
    model: modelId,
    supportsLongContext: true,
    supportsTools: false, // Anthropic tool use requires SDK integration (Phase 2)
    supportsStreaming: true,
    tags: ['anthropic', 'claude'],
  };
}
