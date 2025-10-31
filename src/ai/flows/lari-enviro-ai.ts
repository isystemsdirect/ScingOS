'use server';

/**
 * @fileOverview An Environmental AI model for analyzing air and water quality data.
 *
 * - analyzeEnvironmentalData - A function that analyzes sensor data to assess environmental quality.
 * - EnviroDataInput - The input type for the analyzeEnvironmentalData function.
 * - EnviroDataOutput - The return type for the analyzeEnvironmentalData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const EnviroDataInputSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).describe('The GPS coordinates of the measurement.'),
  airSample: z.object({
    pm25: z.number().describe('Particulate matter 2.5 (µg/m³).'),
    pm10: z.number().describe('Particulate matter 10 (µg/m³).'),
    voc: z.number().describe('Volatile Organic Compounds (ppb).'),
    co: z.number().describe('Carbon Monoxide (ppm).'),
  }).optional().describe('Data from an air quality sensor.'),
  waterSample: z.object({
    ph: z.number().min(0).max(14).describe('The pH level of the water sample.'),
    turbidity: z.number().describe('The turbidity of the water in NTU.'),
    dissolvedOxygen: z.number().describe('The dissolved oxygen level in mg/L.'),
  }).optional().describe('Data from a water quality sensor.'),
});
export type EnviroDataInput = z.infer<typeof EnviroDataInputSchema>;

export const EnviroDataOutputSchema = z.object({
  airQuality: z.object({
    riskLevel: z.enum(['low', 'moderate', 'high', 'hazardous']).describe('The assessed risk level for air quality.'),
    recommendation: z.string().describe('Actionable recommendation based on air quality.'),
  }).optional(),
  waterQuality: z.object({
    riskLevel: z.enum(['low', 'moderate', 'high', 'critical']).describe('The assessed risk level for water quality.'),
    recommendation: z.string().describe('Actionable recommendation based on water quality.'),
  }).optional(),
});
export type EnviroDataOutput = z.infer<typeof EnviroDataOutputSchema>;

export async function analyzeEnvironmentalData(input: EnviroDataInput): Promise<EnviroDataOutput> {
  return lariEnviroAiFlow(input);
}

const enviroPrompt = ai.definePrompt({
  name: 'enviroAnalysisPrompt',
  input: { schema: EnviroDataInputSchema },
  output: { schema: EnviroDataOutputSchema },
  prompt: `You are LARI-Enviro_AI, an AI specializing in environmental data analysis for field inspections.
  
  Analyze the provided air and/or water sample data. Based on established environmental standards (e.g., EPA guidelines), assess the risk level and provide a clear, actionable recommendation for each sample type present.

  Data:
  {{#if airSample}}
  - Air Sample: PM2.5: {{airSample.pm25}} µg/m³, PM10: {{airSample.pm10}} µg/m³, VOC: {{airSample.voc}} ppb, CO: {{airSample.co}} ppm
  {{/if}}
  {{#if waterSample}}
  - Water Sample: pH: {{waterSample.ph}}, Turbidity: {{waterSample.turbidity}} NTU, Dissolved Oxygen: {{waterSample.dissolvedOxygen}} mg/L
  {{/if}}

  Your risk assessment should be conservative.
  - For air: High PM2.5 (>35) or PM10 (>150) is 'high' risk. High VOC (>500) is 'moderate' risk.
  - For water: pH outside 6.5-8.5, high turbidity (>5 NTU), or low dissolved oxygen (< 5 mg/L) are 'high' risk.
  
  Return your response in the required JSON format.
  `,
});

const lariEnviroAiFlow = ai.defineFlow(
  {
    name: 'lariEnviroAiFlow',
    inputSchema: EnviroDataInputSchema,
    outputSchema: EnviroDataOutputSchema,
  },
  async (input) => {
    const { output } = await enviroPrompt(input);
    return output!;
  }
);
