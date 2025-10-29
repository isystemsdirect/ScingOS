'use server';

/**
 * @fileOverview This file defines a Genkit flow for ingesting device telemetry data.
 *
 * - ingestTelemetry - A function that handles the telemetry ingestion process.
 * - TelemetryInput - The input type for the ingestTelemetry function.
 * - TelemetryOutput - The return type for the ingestTelemetry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Based on openapi.yaml TelemetryEnvelope
export const TelemetryInputSchema = z.object({
  keyId: z.string().describe('The ID of the key being used, e.g., Key-LiDAR.'),
  deviceId: z.string().describe('The unique identifier for the physical device.'),
  inspectionId: z.string().optional().describe('The ID of the inspection this telemetry belongs to.'),
  timestampUtc: z.string().datetime().describe('The UTC timestamp of the telemetry event.'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    alt: z.number().optional(),
  }).optional().describe('GPS coordinates of the device.'),
  payloadType: z.enum([
    'lidar_pointcloud',
    'video_chunk',
    'image',
    'spectra',
    'sonar_ping',
    'thermal_frame',
    'audio_chunk',
  ]).describe('The type of data in the payload.'),
  payloadRef: z.string().url().optional().describe('A reference (e.g., GCS URI) to the data payload.'),
  metadata: z.record(z.any()).optional().describe('Any additional metadata.'),
  // This would be derived from the authenticated user in a real scenario
  userId: z.string().describe('The ID of the user ingesting the data for entitlement checks.')
});

export type TelemetryInput = z.infer<typeof TelemetryInputSchema>;

export const TelemetryOutputSchema = z.object({
  status: z.string(),
  telemetryId: z.string(),
});
export type TelemetryOutput = z.infer<typeof TelemetryOutputSchema>;


export async function ingestTelemetry(input: TelemetryInput): Promise<TelemetryOutput> {
  // In a real application, we wouldn't pass the userId in the input.
  // We would get it from the authentication context provided by Next.js/Firebase Auth.
  // The Genkit flow would be called from a server-side API route that verifies the user's session.
  console.log(`Simulating telemetry ingestion for user ${input.userId}`);
  
  // The logic from your Cloud Function would go here:
  // 1. Get the Key document from Firestore using input.keyId.
  // 2. Get the user's custom claims using input.userId.
  // 3. Check if user's entitlements claim includes the key's requiredEntitlement.
  // 4. If authorized, create a new document in /telemetry/{inspectionId}/events.
  // 5. Return the new document ID.

  // For now, we'll just return a mock success response.
  return Promise.resolve({
    status: 'accepted',
    telemetryId: `simulated_${new Date().getTime()}`,
  });
}
