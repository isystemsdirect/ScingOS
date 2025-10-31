
'use server';

/**
 * @fileOverview A Weather AI model for providing location-specific forecasts.
 *
 * - getWeatherForecast - A function that provides a weather forecast for a given location.
 * - WeatherInput - The input type for the getWeatherForecast function.
 * - WeatherOutput - The return type for the getWeatherForecast function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const WeatherInputSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).describe('The GPS coordinates for the weather forecast.'),
  forecastHorizonHours: z.number().min(1).max(48).default(12).describe('The number of hours into the future to forecast.'),
});
export type WeatherInput = z.infer<typeof WeatherInputSchema>;

export const WeatherOutputSchema = z.object({
  current: z.object({
    temperature: z.number().describe('Current temperature in Celsius.'),
    condition: z.string().describe('e.g., "Clear", "Partly Cloudy", "Rain"'),
    windSpeedKph: z.number().describe('Current wind speed in kilometers per hour.'),
    humidity: z.number().min(0).max(100).describe('Current relative humidity percentage.'),
  }),
  hourly: z.array(z.object({
    time: z.string().datetime().describe('The timestamp for the forecast hour.'),
    temperature: z.number().describe('Forecasted temperature in Celsius.'),
    condition: z.string().describe('Forecasted weather condition.'),
    precipitationChance: z.number().min(0).max(100).describe('Chance of precipitation as a percentage.'),
  })).describe('An array of hourly forecast data.'),
  summary: z.string().describe('A human-readable summary of the weather for the forecast period.'),
});
export type WeatherOutput = z.infer<typeof WeatherOutputSchema>;

const getCurrentWeather = ai.defineTool(
    {
      name: 'getCurrentWeather',
      description: 'Returns the current and forecasted weather for a given location using the Google Weather API.',
      inputSchema: WeatherInputSchema,
      outputSchema: WeatherOutputSchema,
    },
    async (input) => {
        const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
        if (!apiKey) {
            throw new Error("Google Weather API key is not configured.");
        }
        
        const url = 'https://weather.googleapis.com/v1/forecast';
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify({
            location: {
                latitude: input.location.lat,
                longitude: input.location.lng,
            },
            // The Google Weather API doesn't support a simple hourly horizon.
            // We request daily and hourly forecasts and the model can interpret.
            params: ["current", "hourly", "daily"], 
        });

        const response = await fetch(`${url}?key=${apiKey}`, {
            method: 'POST',
            headers,
            body
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Weather API request failed: ${response.status} ${errorText}`);
        }
        
        const weatherData = await response.json();

        // We need to transform the API response into our desired schema.
        // The AI model will be instructed to do this, but we'll prepare the data.
        const transformedData: WeatherOutput = {
            current: {
                temperature: weatherData.current?.temperature?.value || 0,
                condition: weatherData.current?.condition?.text || 'Unknown',
                windSpeedKph: weatherData.current?.wind?.speed?.value || 0,
                humidity: weatherData.current?.humidity?.value || 0
            },
            hourly: (weatherData.hourly?.forecasts || []).slice(0, input.forecastHorizonHours).map((h: any) => ({
                time: h.time,
                temperature: h.temperature.value,
                condition: h.condition.text,
                precipitationChance: h.precipitation.probability * 100,
            })),
            summary: `Live forecast for ${input.location.lat}, ${input.location.lng}.`
        };

        return transformedData;
    }
);

export async function getWeatherForecast(input: WeatherInput): Promise<WeatherOutput> {
  return lariWeatherAiFlow(input);
}

const weatherPrompt = ai.definePrompt({
  name: 'weatherForecastPrompt',
  input: { schema: WeatherInputSchema },
  output: { schema: WeatherOutputSchema },
  tools: [getCurrentWeather],
  prompt: `You are LARI-Weather_AI, an AI that provides detailed weather forecasts for field operations.
  
  Use the getCurrentWeather tool to get the weather forecast for the location: {{location.lat}}, {{location.lng}}.
  The forecast should cover the next {{forecastHorizonHours}} hours.
  
  The tool will return the raw data. Your job is to format it correctly and provide a human-readable summary. Highlight any potential operational impacts (e.g., high winds, rain, extreme temperatures) in the summary.
  
  Return your response in the required JSON format.
  `,
});

const lariWeatherAiFlow = ai.defineFlow(
  {
    name: 'lariWeatherAiFlow',
    inputSchema: WeatherInputSchema,
    outputSchema: WeatherOutputSchema,
  },
  async (input) => {
    // The model will automatically call the `getCurrentWeather` tool because of the prompt.
    const { output } = await weatherPrompt(input);
    return output!;
  }
);
