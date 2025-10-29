'use server';

/**
 * @fileOverview An AI agent for generating audio overviews and presentations of inspection reports using Google Cloud Text-to-Speech.
 *
 * - generateAudioPresentations - A function that handles the generation of audio presentations.
 * - GenerateAudioPresentationsInput - The input type for the generateAudioPresentations function.
 * - GenerateAudioPresentationsOutput - The return type for the generateAudioPresentations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {TextToSpeechClient} from '@google-cloud/text-to-speech';

const GenerateAudioPresentationsInputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('The executive summary of the inspection report.'),
  reportDetails: z
    .string()
    .describe('The detailed content of the inspection report.'),
});
export type GenerateAudioPresentationsInput = z.infer<
  typeof GenerateAudioPresentationsInputSchema
>;

const GenerateAudioPresentationsOutputSchema = z.object({
  audioOverview: z
    .string()
    .describe('The audio overview of the inspection report in WAV format as a data URI.'),
  audioPresentation: z
    .string()
    .describe(
      'The longer audio presentation of the inspection report in WAV format as a data URI.'
    ),
});
export type GenerateAudioPresentationsOutput = z.infer<
  typeof GenerateAudioPresentationsOutputSchema
>;

export async function generateAudioPresentations(
  input: GenerateAudioPresentationsInput
): Promise<GenerateAudioPresentationsOutput> {
  return generateAudioPresentationsFlow(input);
}


const generateAudioPresentationsFlow = ai.defineFlow(
  {
    name: 'generateAudioPresentationsFlow',
    inputSchema: GenerateAudioPresentationsInputSchema,
    outputSchema: GenerateAudioPresentationsOutputSchema,
  },
  async input => {
    const ttsClient = new TextToSpeechClient();

    const synthesizeSpeech = async (text: string) => {
        const request = {
            input: { text },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' as const, name: 'en-US-Studio-O' },
            audioConfig: { audioEncoding: 'LINEAR16' as const, sampleRateHertz: 24000 },
        };
        const [response] = await ttsClient.synthesizeSpeech(request);
        if (!response.audioContent) {
            throw new Error('Failed to synthesize speech.');
        }
        const audioBase64 = (response.audioContent as Buffer).toString('base64');
        return `data:audio/wav;base64,${audioBase64}`;
    };

    const [audioOverview, audioPresentation] = await Promise.all([
        synthesizeSpeech(`Create a short audio overview of the following report summary:\n\n${input.executiveSummary}`),
        synthesizeSpeech(`Create a detailed audio presentation based on the following inspection report:\n\n${input.reportDetails}`)
    ]);


    return {
      audioOverview,
      audioPresentation,
    };
  }
);
