'use server';

/**
 * @fileOverview LARI-VISION: An AI model for analyzing image, video, CCTV, drone, and direct visual data.
 *
 * - analyzeVisualData - A function that processes visual information for various inspection tasks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const VisionInputSchema = z.object({
  media: z.array(z.object({
    url: z.string().url().describe("A data URI of the visual media (image or video frame)."),
    mimeType: z.string().optional().describe("The MIME type of the media."),
  })).describe('An array of visual media to analyze.'),
  context: z.string().describe('The context of the inspection (e.g., "Facade inspection of a high-rise building").'),
  industry: z.enum(['Construction', 'Energy', 'Water', 'Transportation', 'Manufacturing', 'Healthcare', 'Agriculture', 'Environmental']).describe('The industry vertical for the analysis.'),
});
export type VisionInput = z.infer<typeof VisionInputSchema>;

export const VisionOutputSchema = z.object({
  anomalies: z.array(z.object({
    type: z.string().describe('The type of anomaly detected (e.g., "Crack", "Corrosion", "Spalling").'),
    location: z.string().describe('A description of where the anomaly is located in the media.'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The assessed severity of the anomaly.'),
    confidence: z.number().min(0).max(1).describe('The confidence score of the detection.'),
  })),
  summary: z.string().describe('A summary of the visual analysis.'),
});
export type VisionOutput = z.infer<typeof VisionOutputSchema>;

export async function analyzeVisualData(input: VisionInput): Promise<VisionOutput> {
  return lariVisionFlow(input);
}

const visionPrompt = ai.definePrompt({
  name: 'lariVisionPrompt',
  input: { schema: VisionInputSchema },
  output: { schema: VisionOutputSchema },
  prompt: `You are LARI-VISION, an AI specializing in analyzing visual data from various industries.
  
  Industry: {{industry}}
  Context: {{context}}

  Analyze the following media:
  {{#each media}}
  - {{media url=this.url}}
  {{/each}}

  Identify and classify any anomalies, assess their severity, and provide a summary.
  `,
});

const lariVisionFlow = ai.defineFlow(
  {
    name: 'lariVisionFlow',
    inputSchema: VisionInputSchema,
    outputSchema: VisionOutputSchema,
  },
  async (input) => {
    const { output } = await visionPrompt(input);
    return output!;
  }
);
