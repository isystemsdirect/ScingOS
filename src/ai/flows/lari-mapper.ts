'use server';

/**
 * @fileOverview LARI-MAPPER: An AI model for processing LiDAR, laser, and 3D volumetric data.
 *
 * - process3dData - A function that analyzes 3D data for structural mapping and geometric analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const MapperInputSchema = z.object({
  pointCloudUrl: z.string().url().describe("A URL to the LiDAR or 3D point cloud data file (e.g., .las, .laz, .ply)."),
  industry: z.enum(['Construction', 'Energy', 'Water', 'Transportation', 'Manufacturing', 'Healthcare', 'Agriculture', 'Environmental']).describe('The industry vertical for the analysis.'),
  analysisType: z.enum(['Floorplan', 'Volumetric', 'Geometric', 'Layout']).describe("The type of analysis to perform."),
});
export type MapperInput = z.infer<typeof MapperInputSchema>;

export const MapperOutputSchema = z.object({
  analysisResult: z.string().describe("A summary of the 3D data analysis."),
  measurements: z.record(z.number()).optional().describe("Key measurements extracted from the data (e.g., volumes, distances)."),
  outputFileUrl: z.string().url().optional().describe("A URL to a generated output file (e.g., a 2D floorplan image or a CAD file)."),
});
export type MapperOutput = z.infer<typeof MapperOutputSchema>;


export async function process3dData(input: MapperInput): Promise<MapperOutput> {
  return lariMapperFlow(input);
}

const mapperPrompt = ai.definePrompt({
  name: 'lariMapperPrompt',
  input: { schema: MapperInputSchema },
  output: { schema: MapperOutputSchema },
  prompt: `You are LARI-MAPPER, an AI specializing in analyzing 3D point cloud data.
  
  Industry: {{industry}}
  Analysis Type: {{analysisType}}
  
  Process the point cloud data from the following location: {{pointCloudUrl}}
  
  Perform the requested analysis and provide the results in the specified JSON format.
  `,
});

const lariMapperFlow = ai.defineFlow(
  {
    name: 'lariMapperFlow',
    inputSchema: MapperInputSchema,
    outputSchema: MapperOutputSchema,
  },
  async (input) => {
    // In a real application, a tool would be used here to fetch and process the large point cloud data.
    const { output } = await mapperPrompt(input);
    return output!;
  }
);
