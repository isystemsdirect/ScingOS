'use server';

/**
 * @fileOverview LARI-GIS: An AI model for analyzing geospatial, satellite, and remote-sensed data.
 *
 * - analyzeGisData - A function that processes GIS layers to provide contextual analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GisInputSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).describe('The central GPS coordinates for the analysis.'),
  layers: z.array(z.enum(['Zoning', 'Floodplain', 'Permits', 'ClimateImpact'])).describe("The GIS layers to analyze."),
  industry: z.enum(['Construction', 'Energy', 'Manufacturing', 'Agriculture', 'Environmental']).describe('The industry vertical.'),
});
export type GisInput = z.infer<typeof GisInputSchema>;

export const GisOutputSchema = z.object({
  summary: z.string().describe("A summary of the geospatial analysis."),
  findings: z.record(z.string()).describe("Key findings for each requested layer."),
});
export type GisOutput = z.infer<typeof GisOutputSchema>;


export async function analyzeGisData(input: GisInput): Promise<GisOutput> {
  return lariGisFlow(input);
}

const gisPrompt = ai.definePrompt({
  name: 'lariGisPrompt',
  input: { schema: GisInputSchema },
  output: { schema: GisOutputSchema },
  prompt: `You are LARI-GIS, an AI specializing in geospatial data analysis.
  
  Industry: {{industry}}
  Location: {{location.lat}}, {{location.lng}}
  
  Analyze the following GIS layers for the specified location:
  {{#each layers}}
  - {{this}}
  {{/each}}
  
  Provide a summary of your findings in the required JSON format.
  `,
});


const lariGisFlow = ai.defineFlow(
  {
    name: 'lariGisFlow',
    inputSchema: GisInputSchema,
    outputSchema: GisOutputSchema,
  },
  async (input) => {
    // In a real app, tools would be used to query actual GIS databases (e.g., Esri, local government data) for each layer.
    const { output } = await gisPrompt(input);
    return output!;
  }
);
