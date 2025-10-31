'use server';

/**
 * @fileOverview A Health AI model for monitoring field personnel biometrics.
 *
 * - monitorFieldHealth - A function that analyzes biometric data for health risks.
 * - HealthDataInput - The input type for the monitorFieldHealth function.
 * - HealthDataOutput - The return type for the monitorFieldHealth function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const HealthDataInputSchema = z.object({
  userId: z.string(),
  biometrics: z.object({
    heartRate: z.number().optional().describe('Current heart rate in beats per minute.'),
    bloodOxygen: z.number().min(0).max(100).optional().describe('Blood oxygen saturation (SpO2) as a percentage.'),
    respiratoryRate: z.number().optional().describe('Breaths per minute.'),
    activityStatus: z.enum(['resting', 'walking', 'running', 'strenuous']).describe('The user\'s current activity level.'),
  }),
  environmentalTemperature: z.number().describe('Ambient temperature in Celsius.'),
});
export type HealthDataInput = z.infer<typeof HealthDataInputSchema>;

export const HealthDataOutputSchema = z.object({
  healthStatus: z.enum(['normal', 'warning', 'danger']).describe('The overall assessment of the user\'s health status.'),
  summary: z.string().describe('A concise summary of the health assessment.'),
  recommendation: z.string().describe('A clear, actionable recommendation for the user.'),
});
export type HealthDataOutput = z.infer<typeof HealthDataOutputSchema>;

export async function monitorFieldHealth(input: HealthDataInput): Promise<HealthDataOutput> {
  return lariHealthAiFlow(input);
}

const healthPrompt = ai.definePrompt({
  name: 'healthAnalysisPrompt',
  input: { schema: HealthDataInputSchema },
  output: { schema: HealthDataOutputSchema },
  prompt: `You are LARI-Health_AI, an AI responsible for monitoring the health and safety of a field inspector.
  
  Analyze the following real-time biometric data from the inspector's wearable sensors. Your goal is to identify potential health risks like heat stress, overexertion, or hypoxia.
  
  Data:
  - User: {{userId}}
  - Biometrics: Heart Rate: {{biometrics.heartRate}} bpm, SpO2: {{biometrics.bloodOxygen}}%, Activity: {{biometrics.activityStatus}}
  - Environment: {{environmentalTemperature}}°C

  Your analysis must be swift and decisive. Consider all factors:
  - Is heart rate too high for the current activity level? (e.g., > 140 bpm while walking).
  - Is blood oxygen level too low? (e.g., < 92%).
  - Is there a risk of heat stress given the temperature and activity level?
  
  Determine the healthStatus ('normal', 'warning', 'danger'), provide a summary, and give a clear recommendation.
  
  - **Normal**: Vitals are within expected ranges. Recommendation: "Vitals normal. Stay hydrated."
  - **Warning**: A metric is approaching a risky threshold. Recommendation: "Heart rate elevated. Consider taking a brief rest."
  - **Danger**: A metric has crossed a critical threshold. Recommendation: "Immediate Action Required: Heart rate is dangerously high. Stop activity, rest in a cool area, and confirm status."
  
  Return your response in the required JSON format.`,
});

const lariHealthAiFlow = ai.defineFlow(
  {
    name: 'lariHealthAiFlow',
    inputSchema: HealthDataInputSchema,
    outputSchema: HealthDataOutputSchema,
  },
  async (input) => {
    const { output } = await healthPrompt(input);
    return output!;
  }
);
