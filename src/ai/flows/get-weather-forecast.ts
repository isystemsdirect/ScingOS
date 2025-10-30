
'use server';

/**
 * @fileOverview This file defines a Genkit flow for LARI-Weather_AI, an expert safety 
 * companion for field inspectors.
 *
 * - lariWeather - A function that returns a detailed, safety-conscious weather analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeatherDataSchema = z.object({
  temperature: z.number().describe('The current temperature in Fahrenheit.'),
  description: z.string().describe('A brief summary of current weather conditions (e.g., "Partly Cloudy").'),
  windSpeed: z.number().describe('The wind speed in miles per hour.'),
  uvIndex: z.number().describe('The UV index, from 0 to 11+ (OpenWeatherMap does not provide this in the free tier, so it will be 0).'),
  alerts: z.array(z.string()).describe('A list of active severe weather alerts (e.g., "Thunderstorm Watch", "High Wind Warning").'),
});

export const WeatherOutputSchema = z.object({
    weatherData: WeatherDataSchema,
    recommendation: z.string(),
});

export type WeatherOutput = z.infer<typeof WeatherOutputSchema>;

const getCurrentWeather = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Returns the current weather for a given location using OpenWeatherMap, including any safety alerts.',
    inputSchema: z.object({
      lat: z.number().describe("Latitude"),
      lng: z.number().describe("Longitude"),
    }),
    outputSchema: WeatherDataSchema,
  },
  async ({ lat, lng }) => {
     const apiKey = process.env.OPENWEATHER_API_KEY;
     if (!apiKey) {
        throw new Error("OpenWeatherMap API key is not configured.");
     }
      
     const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`;
     const response = await fetch(weatherUrl);

     if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenWeatherMap API failed with status ${response.status}: ${errorText}`);
        throw new Error(`Failed to fetch weather data. Status: ${response.status}.`);
     }

     const data = await response.json();
     
     // The free tier of OpenWeatherMap does not provide UV Index or alerts directly.
     // These would require separate API calls or a higher-tier plan.
     const alerts: string[] = [];
     const uvIndex = 0; // Placeholder as it's not in the standard response

     return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0]?.description || 'Not available',
        windSpeed: Math.round(data.wind.speed),
        uvIndex: uvIndex,
        alerts: alerts,
     };
  }
);

const weatherAgentSystemPrompt = `You are LARI-Weather_AI, an expert safety companion for field inspectors. Your primary goal is to keep them safe.

When you receive weather data, you MUST analyze it from a safety perspective and provide a clear, conversational, and actionable recommendation. 

Your final response MUST be a JSON object conforming to the output schema.
- The "weatherData" field must contain the full, unmodified JSON object from the tool.
- The "recommendation" field must contain your conversational safety analysis as a string.

Example for hazardous weather: "The forecast shows high winds at 25 mph and a severe thunderstorm watch is in effect. It is unsafe to conduct exterior inspections, especially with a drone. I recommend postponing the inspection until the storm system passes."

Example for safe weather: "It's currently 72 degrees and sunny with light winds. Conditions are safe for all inspection activities. The UV index is high, so be sure to use sun protection."
`;

const weatherAgent = ai.definePrompt({
  name: 'weatherAgent',
  tools: [getCurrentWeather],
  system: weatherAgentSystemPrompt,
  output: {
    schema: WeatherOutputSchema
  }
});

export const lariWeatherFlow = ai.defineFlow(
  {
    name: 'lariWeatherFlow',
    inputSchema: z.string().describe("A location, such as 'Houston, TX'"),
    outputSchema: WeatherOutputSchema,
  },
  async (location) => {
    // 1. Get coordinates for the location
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
        throw new Error("Google Maps API key is not configured for geocoding.");
    }
    const geocodeResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`);
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.status !== 'OK' || !geocodeData.results?.[0]?.geometry?.location) {
        throw new Error(`Could not geocode location: ${location}. Status: ${geocodeData.status}, Message: ${geocodeData.error_message || 'No results found.'}`);
    }
    const { lat, lng } = geocodeData.results[0].geometry.location;

    // 2. Pass coordinates to the weather agent
    const { output } = await weatherAgent({lat, lng});
    if (!output) {
        throw new Error("Failed to get weather analysis from the agent.");
    }
    return output;
  }
);

export async function lariWeather(location: string): Promise<WeatherOutput> {
  return lariWeatherFlow(location);
}
