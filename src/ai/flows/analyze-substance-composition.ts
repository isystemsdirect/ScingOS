
'use server';

/**
 * @fileOverview A Genkit flow for analyzing the elemental composition of a substance.
 *
 * - analyzeSubstanceComposition - A function that takes a substance name and returns its elemental breakdown.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const SubstanceCompositionInputSchema = z.object({
  substanceQuery: z.string().describe('The name or designation of the substance to analyze, e.g., "304 stainless steel"'),
});
export type SubstanceCompositionInput = z.infer<typeof SubstanceCompositionInputSchema>;

export const SubstanceCompositionOutputSchema = z.object({
  substance: z.string().describe('The normalized or official name of the substance.'),
  elements: z.array(z.object({
    symbol: z.string().describe('The atomic symbol of the element, e.g., "Fe"'),
    percent: z.number().describe('The percentage of this element in the substance.'),
    role: z.string().optional().describe('The role of the element in the alloy, e.g., "Corrosion Resistance"'),
    primary: z.boolean().optional().describe('Whether this is the primary element.'),
  })).describe('The elemental breakdown of the substance.'),
  regulatoryFlags: z.array(z.object({
    code: z.string().describe('The regulatory code, e.g., "REACH", "RoHS", "FDA"'),
    compliant: z.boolean().describe('Whether it is compliant or flagged.'),
    note: z.string().optional().describe('A note about the compliance status.'),
  })).describe('Any regulatory flags associated with the composition.'),
  paidFeatures: z.array(z.string()).describe('A list of premium features unlocked by this analysis.'),
});
export type SubstanceCompositionOutput = z.infer<typeof SubstanceCompositionOutputSchema>;


export async function analyzeSubstanceComposition(input: SubstanceCompositionInput): Promise<SubstanceCompositionOutput> {
  return analyzeSubstanceFlow(input);
}


const analysisPrompt = ai.definePrompt({
    name: 'analyzeSubstancePrompt',
    input: { schema: SubstanceCompositionInputSchema },
    output: { schema: SubstanceCompositionOutputSchema },
    prompt: `You are LARI-PRISM, a world-class materials science AI. Your task is to analyze the following substance and provide a detailed elemental composition.

    Substance Query: {{{substanceQuery}}}
    
    1.  **Simulate API Calls**: You must act as if you are performing real-time API lookups. First, normalize the user's query (e.g., "304 stainless steel pipe" becomes "Type 304 Stainless Steel").
    2.  **Fetch from Authoritative Sources**: Your primary source for composition data must be authoritative databases. Simulate querying these sources in order, using the first successful result:
        - First, try **PubChem**.
        - If no result, try **Materials Project**.
        - If still no result, try **ChemSpider**.
    3.  **Elemental Breakdown**: From the simulated API response, provide the typical elemental composition with percentages. Identify the primary element and the role of other key elements if applicable.
    4.  **Regulatory Check**: Cross-reference the composition against major regulations like REACH and RoHS. Flag any potential issues. For example, check for lead, cadmium, mercury.
    5.  **Premium Features**: Based on the depth of the analysis, determine if this qualifies for premium features. For common alloys like stainless steel, enable 'compliance' and 'traceAnalytics'.

    Return the data in the exact JSON format defined by the output schema.
    `,
});


const analyzeSubstanceFlow = ai.defineFlow(
  {
    name: 'analyzeSubstanceFlow',
    inputSchema: SubstanceCompositionInputSchema,
    outputSchema: SubstanceCompositionOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    return output!;
  }
);
