'use server';

/**
 * @fileOverview A voice command processing AI agent.
 *
 * - processVoiceCommand - A function that processes voice commands and returns the action to take.
 * - VoiceCommandInput - The input type for the processVoiceCommand function.
 * - VoiceCommandOutput - The return type for the processVoiceCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceCommandInputSchema = z.object({
  command: z.string().describe('The voice command uttered by the user.'),
  context: z.string().optional().describe('Additional context about the current application state.'),
});
export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;

const VoiceCommandOutputSchema = z.object({
  action: z.string().describe('The action to take based on the voice command.'),
  parameters: z.record(z.any()).optional().describe('Parameters for the action, if any.'),
  confidence: z.number().describe('The confidence level of the action.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

export async function processVoiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
  return processVoiceCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceCommandPrompt',
  input: {schema: VoiceCommandInputSchema},
  output: {schema: VoiceCommandOutputSchema},
  prompt: `You are a voice command processing AI that helps inspectors control the Scingular application using voice commands.

You will receive a voice command and, optionally, the current application context.
Based on the command, you will determine the appropriate action to take and any parameters required for that action.
You will also provide a confidence level for the action.

Example Actions:
- start_inspection: Starts a new inspection.
- capture_photo: Captures a photo.
- annotate_finding: Annotates a finding with the specified details.
- request_report_summary: Requests a summary of the current report.

Voice Command: {{{command}}}
Context: {{{context}}}

Output format: JSON object conforming to VoiceCommandOutputSchema.
Ensure that the action and confidence are always included in the response.
`,
});

const processVoiceCommandFlow = ai.defineFlow(
  {
    name: 'processVoiceCommandFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
