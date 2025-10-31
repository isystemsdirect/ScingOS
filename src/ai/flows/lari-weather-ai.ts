
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
      outputSchema: z.any(),
    },
    async (input) => {
        const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
        if (!apiKey) {
            throw new Error("Google Weather API key is not configured.");
        }
        
        // Note: Google Weather API is a paid service. This is a mock implementation.
        // In a real app, you would make an HTTP request to the actual API endpoint.
        console.log(`Fetching weather for lat: ${input.location.lat}, lng: ${input.location.lng}`);

        // Mock response simulating a Google Weather API call
        const now = new Date();
        const hourly: WeatherOutput['hourly'] = [];
        for(let i=0; i < input.forecastHorizonHours; i++) {
            const forecastTime = new Date(now.getTime() + (i * 60 * 60 * 1000));
            hourly.push({
                time: forecastTime.toISOString(),
                temperature: 20 + Math.sin(i / 4) * 5,
                condition: i > 4 && i < 7 ? 'Light Rain' : 'Partly Cloudy',
                precipitationChance: i > 4 && i < 7 ? 60 : 10,
            })
        }

        const mockApiResponse: WeatherOutput = {
            current: {
                temperature: 22,
                condition: 'Partly Cloudy',
                windSpeedKph: 15,
                humidity: 65,
            },
            hourly,
            summary: 'Conditions are favorable for the next 4 hours, with a chance of light rain developing this afternoon. Winds will remain moderate.'
        };
        return mockApiResponse;
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
  
  Summarize the data you receive from the tool and highlight any potential operational impacts (e.g., high winds, rain, extreme temperatures).
  
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
    const { output } = await weatherPrompt(input);
    // The model will call the tool and use its output to generate the final response.
    // The final response should conform to WeatherOutputSchema.
    return output!;
  }
);
