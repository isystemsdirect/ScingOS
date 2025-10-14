'use server';

/**
 * @fileOverview This file defines a Genkit flow for cross-checking inspection observations against a library of codes and standards using AI.
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
  return crossCheckStandardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crossCheckStandardsPrompt',
  input: {schema: CrossCheckStandardsInputSchema},
  output: {schema: CrossCheckStandardsOutputSchema},
  prompt: `You are an AI assistant specialized in cross-checking inspection observations and search queries against a library of codes, statutes, and standards. Your task is to analyze the query and identify relevant code citations, relevance scores, excerpts, links to the full documents and jurisdictions.

  Query: {{{searchText}}}

  Please provide the code citations, relevance scores, excerpts, full document links, and jurisdictions in a JSON format.
  Ensure that the codeCitations, relevanceScores, excerpts, fullDocLinks and jurisdictions arrays have the same length.
  If no relevant codes are found, return empty arrays for all fields.
`,
});

const crossCheckStandardsFlow = ai.defineFlow(
  {
    name: 'crossCheckStandardsFlow',
    inputSchema: CrossCheckStandardsInputSchema,
    outputSchema: CrossCheckStandardsOutputSchema,
  },
  async input => {
    // In a real app, you would use a tool here to query a vector database (e.g. Firestore Vector Search)
    // with the user's input to find relevant standards documents. For now, we are just passing the raw query.
    const {output} = await prompt(input);
    return output!;
  }
);
