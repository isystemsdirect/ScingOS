
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

const CodeCitationSchema = z.object({
  citation: z.string().describe('The exact code citation, e.g., "IBC 1011.5.2".'),
  relevance: z.number().describe('A score from 0.0 to 1.0 indicating relevance.'),
  excerpt: z.string().describe('A brief, relevant excerpt from the standard.'),
  docLink: z.string().url().describe('A link to the full document.'),
  jurisdiction: z.string().describe('The applicable jurisdiction, e.g., "International", "USA".'),
});

const CrossCheckStandardsOutputSchema = z.object({
  citations: z.array(CodeCitationSchema).describe('An array of relevant code citations found.'),
});
export type CrossCheckStandardsOutput = z.infer<typeof CrossCheckStandardsOutputSchema>;


const searchBuildingCodesTool = ai.defineTool(
    {
        name: 'searchBuildingCodes',
        description: 'Looks up ICC/IBC/NFPA and other building codes for specific keywords or observations.',
        inputSchema: z.object({ query: z.string() }),
        outputSchema: CrossCheckStandardsOutputSchema,
    },
    async ({ query }) => {
        // In a real application, this would query a vector database (e.g., Firestore Vector Search)
        // For now, we return a mock response based on the query.
        console.log(`Executing building code search for: ${query}`);
        if (query.toLowerCase().includes("stair riser")) {
            return {
                citations: [
                    {
                        citation: 'IBC 1011.5.2',
                        relevance: 0.92,
                        excerpt: 'Riser height. The maximum riser height shall be 7 inches (178 mm) and the minimum riser height shall be 4 inches (102 mm).',
                        docLink: 'https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress',
                        jurisdiction: 'International',
                    }
                ]
            };
        }
        return { citations: [] };
    }
);


export async function crossCheckStandards(input: CrossCheckStandardsInput): Promise<CrossCheckStandardsOutput> {
  return lariComplianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crossCheckStandardsPrompt',
  tools: [searchBuildingCodesTool],
  input: {schema: CrossCheckStandardsInputSchema},
  output: {schema: CrossCheckStandardsOutputSchema},
  prompt: `You are LARI-COMPLIANCE, an AI engine with master-level knowledge of all inspection codes and standards.

  The user has provided the following query: {{{searchText}}}
  
  Use the 'searchBuildingCodes' tool to find relevant code citations.
  Your final response must be in the specified JSON output format.
`,
});

const lariComplianceFlow = ai.defineFlow(
  {
    name: 'lariComplianceFlow',
    inputSchema: CrossCheckStandardsInputSchema,
    outputSchema: CrossCheckStandardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
