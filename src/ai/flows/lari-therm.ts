
'use server';

/**
 * @fileOverview LARI-THERM: An AI model for analyzing thermal and infrared imaging data.
 *
 * - analyzeThermalData - A function that interprets thermal images to identify heat anomalies, moisture, and potential faults.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ThermInputSchema = z.object({
  thermalImageUrl: z.string().url().describe('A URL to the thermal image.'),
  contextImageUrl: z.string().url().optional().describe('A URL to a corresponding standard visual image for context.'),
  inspectionContext: z.string().describe('The context of the inspection (e.g., "Building envelope scan for air leaks", "Electrical panel check").'),
  industry: z.enum(['Construction', 'Energy', 'Manufacturing', 'Healthcare', 'Agriculture', 'Environmental']).describe('The industry vertical.'),
});
export type ThermInput = z.infer<typeof ThermInputSchema>;

export const ThermOutputSchema = z.object({
  anomalies: z.array(z.object({
    type: z.enum(['Heat Loss', 'Moisture Intrusion', 'Overheating Component', 'Insulation Gap', 'Fire Risk', 'Mechanical Wear']).describe('The type of thermal anomaly detected.'),
    temperatureDelta: z.string().optional().describe('The temperature difference noted, if applicable (e.g., "+15°F").'),
    location: z.string().describe('The location of the anomaly in the image.'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The assessed severity.'),
  })),
  summary: z.string().describe('A summary of the thermal analysis.'),
});
export type ThermOutput = z.infer<typeof ThermOutputSchema>;

const thermPrompt = ai.definePrompt({
  name: 'lariThermPrompt',
  input: { schema: ThermInputSchema },
  output: { schema: ThermOutputSchema },
  prompt: `You are LARI-THERM, an AI specializing in thermal image analysis.
  
  Industry: {{industry}}
  Context: {{inspectionContext}}

  Analyze the following thermal image and its corresponding visual context image (if provided).
  
  - Thermal Image: {{media url=thermalImageUrl}}
  {{#if contextImageUrl}}- Visual Context: {{media url=contextImageUrl}}{{/if}}
  
  Identify and classify any thermal anomalies, their temperature differentials, and severity.
  `,
});

const lariThermFlow = ai.defineFlow(
  {
    name: 'lariThermFlow',
    inputSchema: ThermInputSchema,
    outputSchema: ThermOutputSchema,
  },
  async (input) => {
    const { output } = await thermPrompt(input);
    return output!;
  }
);

// This exported function is what the LARI orchestrator will call.
export async function analyzeThermalData(input: ThermInput): Promise<ThermOutput> {
  return await lariThermFlow(input);
}
