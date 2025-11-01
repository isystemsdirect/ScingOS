'use server';

/**
 * @fileOverview LARI-ECHO: An AI model for processing sonar, acoustic, and other subsurface data.
 *
 * - analyzeSubsurfaceData - A function that analyzes acoustic data to detect voids, cracks, or underground objects.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const EchoInputSchema = z.object({
  acousticDataUrl: z.string().url().describe('A URL to the acoustic or sonar data file.'),
  scanType: z.enum(['Foundation Scan', 'Void Detection', 'Pipeline Interior', 'Subgrade Scan', 'Underground Tank Scan']).describe("The type of subsurface scan performed."),
  industry: z.enum(['Construction', 'Energy', 'Water', 'Transportation', 'Agriculture', 'Environmental']).describe('The industry vertical.'),
});
export type EchoInput = z.infer<typeof EchoInputSchema>;

export const EchoOutputSchema = z.object({
  findings: z.array(z.object({
    type: z.string().describe('The type of feature detected (e.g., "Void", "Crack", "Corrosion", "Buried Object").'),
    location: z.string().describe("A description of the feature's location within the scan data."),
    sizeEstimate: z.string().optional().describe('An estimated size of the detected feature.'),
  })),
  summary: z.string().describe('A summary of the subsurface analysis.'),
});
export type EchoOutput = z.infer<typeof EchoOutputSchema>;

export async function analyzeSubsurfaceData(input: EchoInput): Promise<EchoOutput> {
  return lariEchoFlow(input);
}

const echoPrompt = ai.definePrompt({
  name: 'lariEchoPrompt',
  input: { schema: EchoInputSchema },
  output: { schema: EchoOutputSchema },
  prompt: `You are LARI-ECHO, an AI specializing in sonar and acoustic data analysis for subsurface inspections.
  
  Industry: {{industry}}
  Scan Type: {{scanType}}
  
  Analyze the data from the following file: {{acousticDataUrl}}
  
  Identify any voids, cracks, anomalies, or objects and provide a summary of your findings.
  `,
});


const lariEchoFlow = ai.defineFlow(
  {
    name: 'lariEchoFlow',
    inputSchema: EchoInputSchema,
    outputSchema: EchoOutputSchema,
  },
  async (input) => {
    // A tool would be used here to process the raw acoustic data
    const { output } = await echoPrompt(input);
    return output!;
  }
);
