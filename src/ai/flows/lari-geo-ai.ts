'use server';

/**
 * @fileOverview A Geospatial AI model for analyzing geographic patterns and risks.
 *
 * - analyzeGeospatialData - A function that analyzes location data to identify risks.
 * - GeoDataInput - The input type for the analyzeGeospatialData function.
 * - GeoDataOutput - The return type for the analyzeGeospatialData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GeoDataInputSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).describe('The GPS coordinates for analysis.'),
  historicalData: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      eventType: z.string().describe('e.g., "subsidence", "landslide", "flood"'),
      date: z.string().datetime(),
  })).optional().describe('Historical event data for the surrounding area.'),
});
export type GeoDataInput = z.infer<typeof GeoDataInputSchema>;

export const GeoDataOutputSchema = z.object({
  risks: z.array(z.object({
    type: z.enum(['seismic', 'flood', 'subsidence', 'landslide', 'none']).describe('The type of geospatial risk identified.'),
    riskLevel: z.enum(['low', 'moderate', 'high', 'extreme']).describe('The assessed risk level.'),
    confidence: z.number().min(0).max(1).describe('The confidence level of the assessment.'),
    summary: z.string().describe('A brief summary of the risk.'),
  })).describe('An array of identified geospatial risks.'),
});
export type GeoDataOutput = z.infer<typeof GeoDataOutputSchema>;

export async function analyzeGeospatialData(input: GeoDataInput): Promise<GeoDataOutput> {
  return lariGeoAiFlow(input);
}

const geoPrompt = ai.definePrompt({
  name: 'geoAnalysisPrompt',
  input: { schema: GeoDataInputSchema },
  output: { schema: GeoDataOutputSchema },
  prompt: `You are LARI-Geo_AI, an AI specializing in geospatial risk analysis.
  
  Analyze the provided location and any historical event data to identify potential geospatial risks such as seismic activity, flooding, subsidence, or landslides.
  
  Location: {{location.lat}}, {{location.lng}}
  
  Consider proximity to known fault lines, floodplains, and areas with a history of ground instability.
  
  Return your response in the required JSON format. If no significant risks are identified, return an array containing a single risk of type 'none' with a 'low' risk level.
  `,
});

const lariGeoAiFlow = ai.defineFlow(
  {
    name: 'lariGeoAiFlow',
    inputSchema: GeoDataInputSchema,
    outputSchema: GeoDataOutputSchema,
  },
  async (input) => {
    // In a real application, a tool would be used here to fetch data from sources like USGS for seismic data, FEMA for flood maps, etc.
    const { output } = await geoPrompt(input);
    return output!;
  }
);
