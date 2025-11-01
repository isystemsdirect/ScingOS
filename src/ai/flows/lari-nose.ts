'use server';

/**
 * @fileOverview LARI-NOSE: An AI model for analyzing gas, air quality, and leak detection sensor data.
 *
 * - analyzeAirQualityData - A function that interprets sensor readings to detect gas leaks and airborne contaminants.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const NoseInputSchema = z.object({
  sensorReadings: z.record(z.any()).describe('A JSON object of readings from various gas/air quality sensors (e.g., {"CH4": 5, "CO2": 450, "VOC": 120}).'),
  industry: z.enum(['Energy', 'Water', 'Manufacturing', 'Healthcare', 'Agriculture', 'Environmental']).describe('The industry vertical.'),
  locationContext: z.string().describe("Description of the location where readings were taken (e.g., 'Compressor station #3', 'Hospital operating room')."),
});
export type NoseInput = z.infer<typeof NoseInputSchema>;

export const NoseOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the air quality.'),
  alerts: z.array(z.object({
    gas: z.string().describe('The gas or contaminant detected.'),
    level: z.string().describe('The detected level (e.g., "50 ppm").'),
    alertLevel: z.enum(['Info', 'Warning', 'Danger']).describe('The alert level for this reading.'),
    recommendation: z.string().describe('The recommended action.'),
  })).describe('A list of alerts triggered by the readings.'),
});
export type NoseOutput = z.infer<typeof NoseOutputSchema>;


export async function analyzeAirQualityData(input: NoseInput): Promise<NoseOutput> {
  return lariNoseFlow(input);
}

const nosePrompt = ai.definePrompt({
  name: 'lariNosePrompt',
  input: { schema: NoseInputSchema },
  output: { schema: NoseOutputSchema },
  prompt: `You are LARI-NOSE, an AI specializing in air quality and gas leak detection.
  
  Industry: {{industry}}
  Location: {{locationContext}}
  
  Analyze the following sensor readings and report any that exceed normal or safe thresholds. Provide recommendations for any alerts.
  
  Readings:
  \`\`\`json
  {{{JSON.stringify sensorReadings}}}
  \`\`\`
  `,
});

const lariNoseFlow = ai.defineFlow(
  {
    name: 'lariNoseFlow',
    inputSchema: NoseInputSchema,
    outputSchema: NoseOutputSchema,
  },
  async (input) => {
    // In a real application, a tool could be used here to look up safety thresholds for different gases.
    const { output } = await nosePrompt(input);
    return output!;
  }
);
