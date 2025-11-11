
'use server';

/**
 * @fileOverview This file defines the LARI-COMPLIANCE AI flow, which is responsible for learning from and applying a vast, up-to-date knowledge base of all inspection standards across home, commercial, industrial, and mechanical domains.
 *
 * - crossCheckStandards - A function that handles the cross-checking process.
 * - CrossCheckStandardsInput - The input type for the crossCheckStandards function.
 * - CrossCheckStandardsOutput - The return type for the crossCheckStandards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrossCheckStandardsInputSchema = z.object({
  searchText: z
    .string()
    .describe('The text of the inspector observation or search query.'),
});
export type CrossCheckStandardsInput = z.infer<typeof CrossCheckStandardsInputSchema>;

const CrossCheckStandardsOutputSchema = z.object({
  codeCitations: z
    .array(z.string())
    .describe('An array of code citations relevant to the observation.'),
  relevanceScores: z
    .array(z.number())
    .describe('An array of relevance scores for each code citation.'),
  excerpts: z
    .array(z.string())
    .describe('Excerpts from the code citations relevant to the observation.'),
  fullDocLinks: z
    .array(z.string())
    .describe('Links to the full documents of the code citations.'),
  jurisdictions: z
    .array(z.string())
    .describe('Jurisdictions for each of the code citations.'),
});
export type CrossCheckStandardsOutput = z.infer<typeof CrossCheckStandardsOutputSchema>;

export async function crossCheckStandards(input: CrossCheckStandardsInput): Promise<CrossCheckStandardsOutput> {
  return lariComplianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crossCheckStandardsPrompt',
  input: {schema: CrossCheckStandardsInputSchema},
  output: {schema: CrossCheckStandardsOutputSchema},
  prompt: `You are LARI-COMPLIANCE, an AI engine with master-level knowledge of all international, national, and local inspection codes and standards, including but not limited to: home, commercial, industrial, mechanical, electrical, and plumbing. Your knowledge base is continuously updated in real-time.

  Analyze the following inspector's query and cross-reference it against your entire library to find the most relevant code citations, their exact excerpts, and links to the full source documents.

  Query: {{{searchText}}}

  Provide the code citations, relevance scores, excerpts, full document links, and jurisdictions in the specified JSON format.
  If no relevant codes are found, return empty arrays for all fields.
`,
});

const lariComplianceFlow = ai.defineFlow(
  {
    name: 'lariComplianceFlow',
    inputSchema: CrossCheckStandardsInputSchema,
    outputSchema: CrossCheckStandardsOutputSchema,
  },
  async input => {
    // In a production environment, this flow would use a tool to perform a vector search against a comprehensive, up-to-date database of all inspection standards and guidelines.
    const {output} = await prompt(input);
    return output!;
  }
);
