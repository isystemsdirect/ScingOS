'use server';

/**
 * @fileOverview A Genkit flow for querying the Perplexity AI API.
 *
 * - queryPerplexity - A function that takes a user query and returns a response from Perplexity.
 * - PerplexityInput - The input type for the queryPerplexity function.
 * - PerplexityOutput - The return type for the queryPerplexity function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const PerplexityInputSchema = z.object({
  query: z.string().describe('The user query to send to Perplexity.'),
});
export type PerplexityInput = z.infer<typeof PerplexityInputSchema>;

export const PerplexityOutputSchema = z.object({
  answer: z.string().describe('The response from Perplexity AI.'),
});
export type PerplexityOutput = z.infer<typeof PerplexityOutputSchema>;

// This is the exported function that React components will call.
export async function queryPerplexity(
  input: PerplexityInput
): Promise<PerplexityOutput> {
  return queryPerplexityFlow(input);
}

// This is the Genkit flow definition.
const queryPerplexityFlow = ai.defineFlow(
  {
    name: 'queryPerplexityFlow',
    inputSchema: PerplexityInputSchema,
    outputSchema: PerplexityOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set in the environment.');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-large-32k-online',
        messages: [
          {
            role: 'system',
            content: 'Be precise and factual.',
          },
          {
            role: 'user',
            content: input.query,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Perplexity API request failed with status ${response.status}: ${errorBody}`
      );
    }

    const result = await response.json();
    const answer = result.choices[0]?.message?.content || 'No response from Perplexity.';

    return { answer };
  }
);
