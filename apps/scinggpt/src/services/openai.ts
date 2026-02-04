// ScingGPT - OpenAI Service

import OpenAI from 'openai';
import type { OpenAIConfig, ChatMessage } from '../shared/types';
import { DEFAULTS } from '../shared/constants';

class OpenAIService {
  private client: OpenAI | null = null;
  private model: string = DEFAULTS.OPENAI.MODEL;
  private maxTokens: number = DEFAULTS.OPENAI.MAX_TOKENS;
  private temperature: number = DEFAULTS.OPENAI.TEMPERATURE;

  /**
   * Initialize OpenAI client
   */
  initialize(config: OpenAIConfig): void {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true, // For Electron renderer process
    });
    this.model = config.model || DEFAULTS.OPENAI.MODEL;
    this.maxTokens = config.maxTokens || DEFAULTS.OPENAI.MAX_TOKENS;
    this.temperature = config.temperature || DEFAULTS.OPENAI.TEMPERATURE;
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Send a chat completion request
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.client.chat.completions.create({
      model: options?.model || this.model,
      messages,
      max_tokens: options?.maxTokens || this.maxTokens,
      temperature: options?.temperature || this.temperature,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Stream a chat completion
   */
  async *chatStream(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): AsyncGenerator<string, void, unknown> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const stream = await this.client.chat.completions.create({
      model: options?.model || this.model,
      messages,
      max_tokens: options?.maxTokens || this.maxTokens,
      temperature: options?.temperature || this.temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Convert chat history to OpenAI format
   */
  formatMessages(
    history: ChatMessage[],
    systemPrompt?: string
  ): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of history) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    return messages;
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Get available models
   */
  async listModels(): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.client.models.list();
    return response.data
      .filter((model) => model.id.startsWith('gpt'))
      .map((model) => model.id);
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
