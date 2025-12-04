
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
  speech: z.string().describe('The text that Scing should speak in response.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

// Define the tools Scing can use, similar to the Python sketch
const searchBuildingCodes = ai.defineTool({
    name: 'search_building_codes',
    description: 'Looks up ICC/IBC codes for specific keywords.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ results: z.array(z.string()) }),
});

const triggerVisualScan = ai.defineTool({
    name: 'trigger_visual_scan',
    description: 'Triggers LARI-Vision to analyze the camera feed.',
    inputSchema: z.object({ mode: z.string() }),
    outputSchema: z.object({ status: z.string() }),
});

const draftReportSection = ai.defineTool({
    name: 'draft_report_section',
    description: 'Compiles findings into a narrative block for a report.',
    inputSchema: z.object({ findings: z.array(z.string()) }),
    outputSchema: z.object({ draftId: z.string() }),
});


export async function processVoiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
  return lariScingBridgeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceCommandPrompt',
  tools: [searchBuildingCodes, triggerVisualScan, draftReportSection],
  input: {schema: VoiceCommandInputSchema},
  output: {schema: VoiceCommandOutputSchema},
  prompt: `You are SCING, the Human Interface for ScingOS.
- Tone: Calm, competent, concise.
- Mandate: Assist the inspector; verify instead of guessing.
- Transparency: Announce any action or tool you invoke.
- Governance: BANE authorizes all physical/privileged actions.

You will receive a voice command and, optionally, the current application context.
Based on the command, determine the appropriate action to take, any parameters, and the speech response.
If the user asks to search for something, use the 'search_building_codes' tool.
If the user asks to scan something, use the 'trigger_visual_scan' tool.

Voice Command: {{{command}}}
Context: {{{context}}}

Output format must be a JSON object conforming to VoiceCommandOutputSchema.
Ensure that the action, confidence, and a speech response are always included.
`,
});

const lariScingBridgeFlow = ai.defineFlow(
  {
    name: 'lariScingBridgeFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
