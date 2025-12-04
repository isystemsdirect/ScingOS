
'use server';

/**
 * @fileOverview A Guardian Angel AI model for monitoring user safety in field operations.
 *
 * - monitorFieldSafety - A function that analyzes real-time field data to assess risks.
 * - GuardianAngelInput - The input type for the monitorFieldSafety function.
 * - GuardianAngelOutput - The return type for the monitorFieldSafety function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GuardianAngelInputSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).describe('The current GPS coordinates of the user.'),
  timestamp: z.string().datetime().describe('The UTC timestamp of the data capture.'),
  deviceStatus: z.object({
    batteryLevel: z.number().min(0).max(1).describe('The device battery level (0.0 to 1.0).'),
    signalStrength: z.number().min(0).max(1).describe('The network signal strength (0.0 to 1.0).'),
  }),
  environmentalData: z.object({
    temperature: z.number().describe('Ambient temperature in Celsius.'),
    airQualityIndex: z.number().optional().describe('The local Air Quality Index (AQI).'),
    weatherCondition: z.enum(['clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'high_wind']).describe('The current weather condition.'),
  }),
  biometrics: z.object({
    heartRate: z.number().optional().describe("The user's current heart rate in beats per minute."),
    activityStatus: z.enum(['stationary', 'walking', 'running', 'fall_detected']).describe("The user's current physical activity, detected by accelerometer."),
  }).optional().describe('Optional biometric data from a wearable device.'),
});
export type GuardianAngelInput = z.infer<typeof GuardianAngelInputSchema>;


export const GuardianAngelOutputSchema = z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('The assessed risk level for the user.'),
    summary: z.string().describe('A concise summary of the current safety situation and any identified risks.'),
    recommendedAction: z.string().describe('A clear, actionable recommendation for the user to mitigate any identified risks (e.g., "Seek shelter immediately," "Charge device soon," "No action needed").'),
});
export type GuardianAngelOutput = z.infer<typeof GuardianAngelOutputSchema>;


export async function monitorFieldSafety(input: GuardianAngelInput): Promise<GuardianAngelOutput> {
  return lariGuangelAiFlow(input);
}


const safetyPrompt = ai.definePrompt({
  name: 'safetyAnalysisPrompt',
  input: { schema: GuardianAngelInputSchema },
  output: { schema: GuardianAngelOutputSchema },
  prompt: `You are LARI-GUAngel_AI, a Guardian Angel AI responsible for monitoring the safety of a field inspector.
  
  Analyze the following real-time data from the inspector's sensors. Your primary goal is to identify immediate and potential risks to their safety.
  
  Data:
  - Location: {{location.lat}}, {{location.lng}}
  - Timestamp: {{timestamp}}
  - Device Status: {{deviceStatus.batteryLevel}}% battery, {{deviceStatus.signalStrength}}% signal
  - Environment: {{environmentalData.temperature}}°C, {{environmentalData.weatherCondition}}
  {{#if environmentalData.airQualityIndex}}- Air Quality Index: {{environmentalData.airQualityIndex}}{{/if}}
  {{#if biometrics}}- Biometrics: Heart rate at {{biometrics.heartRate}} bpm, activity is {{biometrics.activityStatus}}{{/if}}

  Your analysis must be swift and decisive. Consider all factors:
  - **Environmental threats**: Is the weather dangerous (high_wind, thunderstorm)? Is the temperature extreme?
  - **Device health**: Is the battery critically low? Is signal loss a risk for communication? A battery below 20% is a medium risk, below 10% is high. Signal below 10% is a high risk.
  - **Biometric anomalies**: Is the heart rate unusually high or low for the activity? Has a fall been detected? A fall detected is ALWAYS a 'critical' risk.
  
  Based on your analysis, determine the overall riskLevel ('low', 'medium', 'high', 'critical'), provide a concise summary, and state a clear recommendedAction.
  
  - **Low Risk**: Standard conditions, no immediate threats. Action: "Continue operations."
  - **Medium Risk**: A potential issue is detected that requires awareness. Action: Provide a specific warning (e.g., "Charge device soon," "Be aware of dropping temperatures.").
  - **High Risk**: An immediate potential danger is present. Action: Advise a specific preventative measure (e.g., "Seek shelter due to high winds," "Find a location with better signal.").
  - **Critical Risk**: A life-threatening situation is detected. Action: Give a clear, urgent command (e.g., "Emergency: Fall detected! Confirm your status immediately.", "Evacuate area due to hazardous weather.").
  
  Return your response in the required JSON format.`,
});


const lariGuangelAiFlow = ai.defineFlow(
  {
    name: 'lariGuangelAiFlow',
    inputSchema: GuardianAngelInputSchema,
    outputSchema: GuardianAngelOutputSchema,
  },
  async (input) => {
    const { output } = await safetyPrompt(input);
    return output!;
  }
);
