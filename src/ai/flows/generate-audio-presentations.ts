'use server';

/**
 * @fileOverview An AI agent for generating audio overviews and presentations of inspection reports using AI-powered text-to-speech.
 *
 * - generateAudioPresentations - A function that handles the generation of audio presentations.
 * - GenerateAudioPresentationsInput - The input type for the generateAudioPresentations function.
 * - GenerateAudioPresentationsOutput - The return type for the generateAudioPresentations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

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
    .describe('The audio overview of the inspection report in WAV format.'),
  audioPresentation: z
    .string()
    .describe(
      'The longer audio presentation of the inspection report in WAV format.'
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

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateAudioPresentationsFlow = ai.defineFlow(
  {
    name: 'generateAudioPresentationsFlow',
    inputSchema: GenerateAudioPresentationsInputSchema,
    outputSchema: GenerateAudioPresentationsOutputSchema,
  },
  async input => {
    // Generate the short audio overview
    const overviewResult = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: `Create a short audio overview of the following report summary:\n\n${input.executiveSummary}`,
    });

    if (!overviewResult.media) {
      throw new Error('No media returned for audio overview.');
    }

    const overviewAudioBuffer = Buffer.from(
      overviewResult.media.url.substring(
        overviewResult.media.url.indexOf(',') + 1
      ),
      'base64'
    );

    const audioOverviewWav = 'data:audio/wav;base64,' + (await toWav(overviewAudioBuffer));

    // Generate the longer audio presentation
    const presentationResult = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: `Create a detailed audio presentation based on the following inspection report:\n\n${input.reportDetails}`,
    });

    if (!presentationResult.media) {
      throw new Error('No media returned for audio presentation.');
    }

    const presentationAudioBuffer = Buffer.from(
      presentationResult.media.url.substring(
        presentationResult.media.url.indexOf(',') + 1
      ),
      'base64'
    );
    const audioPresentationWav = 'data:audio/wav;base64,' + (await toWav(presentationAudioBuffer));

    return {
      audioOverview: audioOverviewWav,
      audioPresentation: audioPresentationWav,
    };
  }
);
