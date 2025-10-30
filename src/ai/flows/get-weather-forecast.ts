
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing weather forecasts.
 * It simulates LARI-Weather_AI by providing detailed, safety-conscious weather analysis
 * for field inspectors.
 *
 * - getWeatherForecast - A function that returns a conversational weather forecast and safety recommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';


const getLocationCoordinates = ai.defineTool(
    {
        name: 'getLocationCoordinates',
        description: 'Gets the latitude and longitude for a given location string.',
        inputSchema: z.object({
            location: z.string().describe('The city and state, e.g., "Houston, TX".'),
        }),
        outputSchema: z.object({
            lat: z.number(),
            lng: z.number(),
        }),
    },
    async ({ location }) => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            throw new Error("Google Maps API key is not configured.");
        }
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`);
        const data = await response.json();
        if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) {
            throw new Error(`Could not geocode location: ${location}. Status: ${data.status}`);
        }
        return data.results[0].geometry.location;
    }
);


const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Returns the current and forecasted weather for a given location, including any safety alerts.',
    inputSchema: z.object({
      lat: z.number().describe("Latitude"),
      lng: z.number().describe("Longitude"),
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
  async ({ lat, lng }) => {
     const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
     if (!apiKey) {
        throw new Error("Google Maps API key is not configured.");
     }

     const response = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            location: { latitude: lat, longitude: lng },
            languageCode: "en-US",
            units: "IMPERIAL",
        })
     });
    
     if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch weather data: ${response.status} ${errorText}`);
     }

     const data = await response.json();

     // Google Weather API does not provide alerts directly in currentConditions.
     // This would require a separate call to a service like weather.gov or another provider.
     // We will return an empty array for now.
     const alerts: string[] = [];

     return {
        temperature: Math.round(data.currentConditions.temperature),
        description: data.currentConditions.shortText,
        windSpeed: Math.round(data.currentConditions.windSpeed),
        precipitationChance: (data.currentConditions.precipitation.probability || 0) * 100,
        uvIndex: data.currentConditions.uvIndex,
        alerts: alerts,
     };
  }
);

const weatherAgentSystemPrompt = `You are LARI-Weather_AI, an expert safety companion for field inspectors. Your primary goal is to keep them safe.

When a user asks for the weather for a location, you MUST use your tools in a specific order:
1. First, you MUST use the \`getLocationCoordinates\` tool to get the latitude and longitude for the location provided by the user.
2. Second, you MUST use the latitude and longitude from the previous step to call the \`getWeather\` tool to get the current conditions.
3. Finally, you MUST analyze the weather data from a safety perspective and provide a clear, conversational, and actionable response. Your response should consist of two parts:
    - **Forecast Summary:** Briefly describe the current and upcoming weather conditions.
    - **Safety Recommendation:** Based on the data, provide a clear safety recommendation. State whether conditions are "safe for inspection," "require caution," or are "unsafe." Mention specific hazards like high winds, lightning risk (based on alerts), high UV index, or chance of rain.

Example for hazardous weather: "The forecast shows high winds at 25 mph and a severe thunderstorm watch is in effect. It is unsafe to conduct exterior inspections, especially with a drone. I recommend postponing the inspection until the storm system passes."

Example for safe weather: "It's currently 72 degrees and sunny. Conditions are safe for all inspection activities. The UV index is high, so be sure to use sun protection."
`;

const weatherAgent = ai.definePrompt({
  name: 'weatherAgent',
  tools: [getWeather, getLocationCoordinates],
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
