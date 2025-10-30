
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing weather forecasts.
 * It simulates LARI-Weather_AI by providing detailed, safety-conscious weather analysis
 * for field inspectors.
 *
 * - getWeatherForecast - A function that returns a conversational weather forecast and safety recommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Returns the current and forecasted weather for a given location, including any safety alerts.',
    inputSchema: z.object({
      location: z.string().describe('The city and state to get the weather for, e.g., "Houston, TX".'),
    }),
    outputSchema: z.object({
      temperature: z.number().describe('The current temperature in Fahrenheit.'),
      description: z.string().describe('A brief summary of current weather conditions (e.g., "Partly Cloudy").'),
      windSpeed: z.number().describe('The wind speed in miles per hour.'),
      precipitationChance: z.number().describe('The percentage chance of precipitation in the next hour.'),
      uvIndex: z.number().describe('The UV index, from 0 to 11+.'),
      alerts: z.array(z.string()).describe('A list of active severe weather alerts (e.g., "Thunderstorm Watch", "High Wind Warning").'),
    }),
  },
  async (input) => {
    // In a real application, this would call a weather API (e.g., Tomorrow.io, OpenWeather).
    // For now, we'll return detailed mock data to simulate LARI-Weather_AI's capabilities.
    console.log(`Fetching weather for ${input.location}`);
    
    // Let's simulate a more hazardous condition for demonstration
    if (input.location.toLowerCase().includes('houston')) {
        return {
            temperature: 88,
            description: 'Overcast with distant thunder.',
            windSpeed: 25,
            precipitationChance: 75,
            uvIndex: 2,
            alerts: ["Severe Thunderstorm Watch", "High Wind Advisory"],
        };
    }

    return {
      temperature: 72,
      description: 'Sunny with a light breeze.',
      windSpeed: 5,
      precipitationChance: 10,
      uvIndex: 8,
      alerts: [],
    };
  }
);

const weatherAgentSystemPrompt = `You are LARI-Weather_AI, an expert safety companion for field inspectors. Your primary goal is to keep them safe.

When a user asks for the weather, use the getWeather tool to get the current conditions.

Then, you MUST analyze this data from a safety perspective and provide a clear, conversational, and actionable response. Your response should consist of two parts:
1.  **Forecast Summary:** Briefly describe the current and upcoming weather conditions.
2.  **Safety Recommendation:** Based on the data, provide a clear safety recommendation. State whether conditions are "safe for inspection," "require caution," or are "unsafe." Mention specific hazards like high winds, lightning risk (based on alerts), high UV index, or chance of rain.

Example for hazardous weather: "The forecast shows high winds at 25 mph and a severe thunderstorm watch is in effect. It is unsafe to conduct exterior inspections, especially with a drone. I recommend postponing the inspection until the storm system passes."

Example for safe weather: "It's currently 72 degrees and sunny. Conditions are safe for all inspection activities. The UV index is high, so be sure to use sun protection."
`;

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
