
'use server';

/**
 * @fileOverview LARI-MAPPER: An AI model for processing LiDAR, laser, and 3D volumetric data.
 *
 * - process3dData - A function that analyzes 3D data for structural mapping and geometric analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { SignedLiDARFrame } from '@/lib/lari-types';

export const MapperInputSchema = z.custom<SignedLiDARFrame>();
export type MapperInput = z.infer<typeof MapperInputSchema>;

const FindingSchema = z.object({
    type: z.string().describe("The type of finding, e.g., 'code_violation'."),
    category: z.string().describe("The category of the finding, e.g., 'stairs'."),
    code_ref: z.string().describe("The specific building code reference, e.g., 'IBC_1011.5.2'."),
    message: z.string().describe("A descriptive message about the finding."),
    severity: z.enum(['low', 'medium', 'high', 'critical']).describe("The severity of the finding."),
});

export const MapperOutputSchema = z.object({
  graph_id: z.string().describe("The ID of the generated or updated spatial graph."),
  scan_id: z.string().describe("The ID of the processed scan."),
  inspection_id: z.string().describe("The ID of the parent inspection."),
  sdr_id: z.string().optional().describe("The Secure Data Record ID from BANE."),
  findings: z.array(FindingSchema).describe("A list of findings generated from the scan analysis."),
});
export type MapperOutput = z.infer<typeof MapperOutputSchema>;


export async function process3dData(input: MapperInput): Promise<MapperOutput> {
  return lariMapperFlow(input);
}

const mapperPrompt = ai.definePrompt({
  name: 'lariMapperPrompt',
  input: { schema: z.object({ pointCloudUrl: z.string() }) }, // The prompt still just needs the URL for the mock
  output: { schema: MapperOutputSchema },
  prompt: `You are LARI-MAPPER, an AI specializing in analyzing 3D point cloud data for building inspections.
  
  Process the point cloud data from the following location: {{pointCloudUrl}}
  
  Perform semantic segmentation on the point cloud to identify building elements like floors, walls, and stairs.
  Run building code compliance checks on the segmented data. For example, check stair riser height against IBC 1011.5.2 (~7.75 inches / 0.196m).

  Return the results, including any code violation findings, in the specified JSON format.
  `,
});

const lariMapperFlow = ai.defineFlow(
  {
    name: 'lariMapperFlow',
    inputSchema: MapperInputSchema,
    outputSchema: MapperOutputSchema,
  },
  async (input) => {
    // In a real application, this flow would call the backend service you defined.
    // For now, we simulate the output from the AI model, passing the blob_uri to the prompt.
    const { output } = await mapperPrompt({ pointCloudUrl: input.blob_uri });
    // We add the other details from the input to the final output to match the full schema.
    return {
      ...output!,
      graph_id: output?.graph_id || `graph_${input.inspection_id}`,
      scan_id: input.scan_id,
      inspection_id: input.inspection_id,
      sdr_id: input.bane_sdr_id,
    };
  }
);
