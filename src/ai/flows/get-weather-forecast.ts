
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing weather forecasts.
 *
 * - getWeatherForecast - A function that returns a weather forecast string.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Returns the current weather for a given location.',
    inputSchema: z.object({
      location: z.string().describe('The location to get the weather for.'),
    }),
    outputSchema: z.object({
      temperature: z.number().describe('The current temperature in Fahrenheit.'),
      description: z.string().describe('A brief description of the weather.'),
      windSpeed: z.number().describe('The wind speed in miles per hour.'),
    }),
  },
  async (input) => {
    // In a real application, this would call a weather API.
    // For now, we'll return mock data.
    console.log(`Fetching weather for ${input.location}`);
    return {
      temperature: 72,
      description: 'Sunny with a light breeze.',
      windSpeed: 5,
    };
  }
);

const weatherAgentSystemPrompt = `You are a helpful AI assistant that can provide weather forecasts.
When a user asks for the weather, use the getWeather tool to get the current conditions.
Formulate a friendly, conversational response with the information you receive.`;

const weatherAgent = ai.definePrompt({
  name: 'weatherAgent',
  tools: [getWeather],
  system: weatherAgentSystemPrompt,
});

export const weatherAgentFlow = ai.defineFlow(
  {
    name: 'weatherAgentFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const response = await weatherAgent(prompt);
    return response.text;
  }
);

export async function getWeatherForecast(location: string): Promise<string> {
  return weatherAgentFlow(`What is the weather in ${location}?`);
}
