
'use server';

/**
 * @fileOverview The LARI (Logistical, Analytical, & Reporting Interface) Main Orchestrator.
 * This is the central AI brain that delegates tasks to specialized sub-engines.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { analyzeVisualData, VisionInputSchema } from './lari-vision';
import { process3dData, MapperInputSchema } from './lari-mapper';
import { analyzeThermalData, ThermInputSchema } from './lari-therm';

// Define the types of tasks LARI can handle
const LariTaskTypeSchema = z.enum([
    'analyze_visual',
    'process_3d_data',
    'analyze_thermal',
    // Add other sub-engine tasks here as they are integrated
]);

// A generic input schema that can hold data for any sub-engine
export const LariFlowInputSchema = z.object({
  taskType: LariTaskTypeSchema.describe("The type of analysis to perform."),
  inputData: z.any().describe("The data payload for the specified task, conforming to the sub-engine's input schema."),
});
export type LariFlowInput = z.infer<typeof LariFlowInputSchema>;

// The main LARI orchestrator flow
export const lariFlow = ai.defineFlow(
  {
    name: 'lariOrchestrator',
    inputSchema: LariFlowInputSchema,
    outputSchema: z.any(), // Output will be the result of the sub-engine
  },
  async ({ taskType, inputData }) => {
    
    console.log(`LARI Orchestrator received task: ${taskType}`);

    switch (taskType) {
      case 'analyze_visual':
        // Validate input against the specific sub-engine schema
        const visionInput = VisionInputSchema.parse(inputData);
        return await analyzeVisualData(visionInput);

      case 'process_3d_data':
        const mapperInput = MapperInputSchema.parse(inputData);
        return await process3dData(mapperInput);

      case 'analyze_thermal':
        const thermalInput = ThermInputSchema.parse(inputData);
        return await analyzeThermalData(thermalInput);
      
      // Add cases for other sub-engines here
      // e.g., case 'analyze_aerial': ...

      default:
        throw new Error(`Unsupported LARI task type: ${taskType}`);
    }
  }
);
