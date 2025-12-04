
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
  findings: z.array(z.object({
    finding_type: z.string().describe('The type of defect or finding, e.g., "defect_crack", "hazard_water_intrusion".'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The assessed severity of the finding.'),
    confidence: z.number().min(0).max(1).describe('The confidence score of the detection.'),
    location_context: z.object({
        x_min: z.number(),
        y_min: z.number(),
        x_max: z.number(),
        y_max: z.number(),
    }).describe('The bounding box of the finding as a percentage of image dimensions.'),
    suggested_tags: z.array(z.string()).describe('A list of suggested tags for categorization, e.g., ["structural", "immediate_action"].'),
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
  prompt: `You are LARI-VISION, an AI specializing in analyzing visual data for industrial and commercial inspections.
  
  Industry: {{industry}}
  Context: {{context}}

  Analyze the following media:
  {{#each media}}
  - {{media url=this.url}}
  {{/each}}

  Identify and classify any anomalies according to the defined ontology (e.g., 'defect_crack', 'hazard_water_intrusion', 'hazard_electrical').
  For each finding, provide the precise finding type, severity, confidence, bounding box coordinates, and suggested organizational tags.
  Return your response in the exact JSON format specified by the output schema.
  `,
});

const lariVisionFlow = ai.defineFlow(
  {
    name: 'lariVisionFlow',
    inputSchema: VisionInputSchema,
    outputSchema: VisionOutputSchema,
  },
  async (input) => {
    // This flow acts as the middleware service layer described in Phase 4.2
    // It receives the request, calls the underlying model (Vertex AI Endpoint), and formats the output.
    const { output } = await visionPrompt(input);
    return output!;
  }
);


