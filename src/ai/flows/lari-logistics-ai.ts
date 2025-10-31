'use server';

/**
 * @fileOverview A Logistics AI model for optimizing routes and tracking assets.
 *
 * - optimizeRoute - A function that calculates the optimal route for multiple destinations.
 * - LogisticsInput - The input type for the optimizeRoute function.
 * - LogisticsOutput - The return type for the optimizeRoute function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LocationSchema = z.object({
  id: z.string().describe('A unique identifier for this location.'),
  lat: z.number(),
  lng: z.number(),
  name: z.string().optional().describe('The name of the location.'),
});

export const LogisticsInputSchema = z.object({
  startLocation: LocationSchema.describe('The starting point for the route.'),
  destinations: z.array(LocationSchema).min(1).describe('An array of destinations to visit.'),
  returnToStart: z.boolean().default(false).describe('Whether the route should end back at the start location.'),
  trafficModel: z.enum(['optimistic', 'pessimistic', 'best_guess']).default('best_guess').describe('The traffic model to use for travel time estimation.'),
});
export type LogisticsInput = z.infer<typeof LogisticsInputSchema>;

export const LogisticsOutputSchema = z.object({
  optimizedRoute: z.array(z.string()).describe('An ordered list of location IDs representing the most efficient route.'),
  totalEstimatedTimeMinutes: z.number().describe('The total estimated travel time in minutes.'),
  totalEstimatedDistanceMeters: z.number().describe('The total estimated travel distance in meters.'),
  waypoints: z.array(LocationSchema).describe('The full location objects in their optimized order.'),
});
export type LogisticsOutput = z.infer<typeof LogisticsOutputSchema>;

export async function optimizeRoute(input: LogisticsInput): Promise<LogisticsOutput> {
  return lariLogisticsAiFlow(input);
}

const logisticsPrompt = ai.definePrompt({
  name: 'logisticsOptimizationPrompt',
  input: { schema: LogisticsInputSchema },
  output: { schema: LogisticsOutputSchema },
  prompt: `You are LARI-Logistics_AI, an AI specializing in route optimization for field service operations.
  
  Given a start location and a set of destinations, calculate the most efficient route that visits all destinations. This is a Traveling Salesperson Problem (TSP).
  
  Start: {{startLocation.name}} ({{startLocation.lat}}, {{startLocation.lng}})
  Destinations:
  {{#each destinations}}
  - {{this.name}} ({{this.lat}}, {{this.lng}})
  {{/each}}
  
  Use the '{{trafficModel}}' traffic model. The route should {{#if returnToStart}}return to the start location{{else}}end at the last destination{{/if}}.
  
  Provide the optimized route as an ordered list of location IDs, along with the total estimated time and distance, and the full waypoint data in order.
  
  Return your response in the required JSON format.
  `,
});

const lariLogisticsAiFlow = ai.defineFlow(
  {
    name: 'lariLogisticsAiFlow',
    inputSchema: LogisticsInputSchema,
    outputSchema: LogisticsOutputSchema,
  },
  async (input) => {
    // In a real application, a tool would be used here to call a service like the Google Maps Directions API to solve the TSP.
    // For this example, we will just return the destinations in the order they were provided.
    const { output } = await logisticsPrompt(input);
    
    // MOCK IMPLEMENTATION:
    const waypoints = [input.startLocation, ...input.destinations];
    if (input.returnToStart) {
        waypoints.push(input.startLocation);
    }
    const mockOutput: LogisticsOutput = {
        optimizedRoute: waypoints.map(w => w.id),
        totalEstimatedTimeMinutes: 125,
        totalEstimatedDistanceMeters: 85000,
        waypoints: waypoints
    };
    
    // In a real implementation you would return `output!`. Here we return mock data.
    return mockOutput;
  }
);
