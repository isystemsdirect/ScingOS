'use server';

/**
 * @fileOverview LARI-PRISM: An AI model for analyzing spectrometry and advanced sensor data for hazard detection.
 *
 * - analyzeSpectrometryData - A function that interprets sensor data to identify chemical compositions and hazards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const PrismInputSchema = z.object({
  sensorData: z.record(z.any()).describe('A JSON object representing the data from the spectrometer or hazard sensor.'),
  industry: z.enum(['Energy', 'Water', 'Manufacturing', 'Healthcare', 'Agriculture', 'Environmental']).describe('The industry vertical.'),
  substanceScanned: z.string().describe("The substance being scanned (e.g., 'water sample', 'air sample', 'pharmaceutical batch')."),
});
export type PrismInput = z.infer<typeof PrismInputSchema>;

export const PrismOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the sensor data.'),
  identifiedSubstances: z.array(z.object({
    name: z.string().describe('Name of the identified substance.'),
    concentration: z.string().describe('Concentration of the substance (e.g., "12 ppm").'),
    isHazardous: z.boolean().describe('Whether the substance is considered hazardous at this concentration.'),
  })).describe('A list of substances identified in the sample.'),
  riskLevel: z.enum(['None', 'Low', 'Medium', 'High', 'Critical']).describe('The overall risk level assessed from the data.'),
});
export type PrismOutput = z.infer<typeof PrismOutputSchema>;

export async function analyzeSpectrometryData(input: PrismInput): Promise<PrismOutput> {
  return lariPrismFlow(input);
}

const prismPrompt = ai.definePrompt({
  name: 'lariPrismPrompt',
  input: { schema: PrismInputSchema },
  output: { schema: PrismOutputSchema },
  prompt: `You are LARI-PRISM, an AI specializing in spectrometry and advanced sensor data analysis.
  
  Industry: {{industry}}
  Substance Scanned: {{substanceScanned}}

  Analyze the following sensor data:
  \`\`\`json
  {{{JSON.stringify sensorData}}}
  \`\`\`
  
  Identify the chemical composition, assess any hazards, and determine the overall risk level.
  `,
});

const lariPrismFlow = ai.defineFlow(
  {
    name: 'lariPrismFlow',
    inputSchema: PrismInputSchema,
    outputSchema: PrismOutputSchema,
  },
  async (input) => {
    const { output } = await prismPrompt(input);
    return output!;
  }
);
