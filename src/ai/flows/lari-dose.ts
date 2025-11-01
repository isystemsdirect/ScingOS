'use server';

/**
 * @fileOverview LARI-DOSE (DroneOps, Remote, Aerial): An AI model for processing aerial data from drones.
 *
 * - analyzeAerialData - A function that analyzes aerial imagery and telemetry for large-scale inspections.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const DoseInputSchema = z.object({
  flightLogUrl: z.string().url().describe("URL to the drone flight log."),
  mediaUrls: z.array(z.string().url()).describe("URLs to aerial images or video clips."),
  industry: z.enum(['Construction', 'Energy', 'Water', 'Transportation', 'Agriculture', 'Environmental']).describe('The industry vertical.'),
  inspectionType: z.string().describe("e.g., 'Transmission line inspection', 'Crop analysis'."),
});
export type DoseInput = z.infer<typeof DoseInputSchema>;

export const DoseOutputSchema = z.object({
  summary: z.string().describe("A high-level summary of the aerial inspection findings."),
  pointsOfInterest: z.array(z.object({
    location: z.object({ lat: z.number(), lng: z.number() }),
    description: z.string().describe("Description of the point of interest."),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  })),
});
export type DoseOutput = z.infer<typeof DoseOutputSchema>;

export async function analyzeAerialData(input: DoseInput): Promise<DoseOutput> {
  return lariDoseFlow(input);
}

const dosePrompt = ai.definePrompt({
  name: 'lariDosePrompt',
  input: { schema: DoseInputSchema },
  output: { schema: DoseOutputSchema },
  prompt: `You are LARI-DOSE, an AI specializing in Drone Operations data analysis.
  
  Industry: {{industry}}
  Inspection Type: {{inspectionType}}

  Analyze the flight log and associated media to identify key findings and points of interest.
  
  - Flight Log: {{flightLogUrl}}
  - Media:
  {{#each mediaUrls}}
  - {{this}}
  {{/each}}

  Provide a summary and list of all identified points of interest.
  `,
});


const lariDoseFlow = ai.defineFlow(
  {
    name: 'lariDoseFlow',
    inputSchema: DoseInputSchema,
    outputSchema: DoseOutputSchema,
  },
  async (input) => {
    // Tools would be used here to process flight logs and large media files
    const { output } = await dosePrompt(input);
    return output!;
  }
);
