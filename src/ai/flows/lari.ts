
'use server';

/**
 * @fileOverview The LARI (Logistical, Analytical, & Reporting Interface) Main Orchestrator.
 * This is the central AI brain that delegates tasks to specialized sub-engines,
 * processes their findings through a risk analysis layer (PRECOG),
 * and synthesizes the final output for the user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { analyzeVisualData, VisionInputSchema } from './lari-vision';
import { process3dData, MapperInputSchema } from './lari-mapper';
import { analyzeThermalData, ThermInputSchema } from './lari-therm';
import { ingestAndPredict, type PrecogInput } from './lari-precog';


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
    outputSchema: z.any(), // The final, synthesized output for SCING
  },
  async ({ taskType, inputData }) => {
    
    console.log(`LARI Orchestrator: Received task '${taskType}'.`);

    // 1. Dispatch task to the appropriate sub-engine
    let subEngineOutput: any;
    switch (taskType) {
      case 'analyze_visual':
        const visionInput = VisionInputSchema.parse(inputData);
        subEngineOutput = await analyzeVisualData(visionInput);
        break;

      case 'process_3d_data':
        const mapperInput = MapperInputSchema.parse(inputData);
        subEngineOutput = await process3dData(mapperInput);
        break;

      case 'analyze_thermal':
        const thermalInput = ThermInputSchema.parse(inputData);
        subEngineOutput = await analyzeThermalData(thermalInput);
        break;
      
      // Add cases for other sub-engines here
      // e.g., case 'analyze_aerial': ...

      default:
        throw new Error(`Unsupported LARI task type: ${taskType}`);
    }

    console.log('LARI Orchestrator: Sub-engine processing complete.');

    // 2. (Conceptual) Route sub-engine output through LARI-PRECOG for risk analysis.
    // In a real implementation, `subEngineOutput` would be converted into a `TelemetryFrameInput`
    // and passed to the `ingestAndPredict` flow.
    const precogInput: PrecogInput = {
        telemetry_frame: { // This is a mock conversion
            id: 'asset-123',
            mission_id: 'mission-456',
            t: subEngineOutput?.findings?.[0]?.temperature || 25,
            v: subEngineOutput?.findings?.[0]?.vibration || 0.1,
            p: 1013.25,
            load: Math.random(),
            failure_threshold: 0.9,
        }
    };
    // const threatHypotheses = await ingestAndPredict(precogInput);
    console.log('LARI Orchestrator: PRECOG analysis layer (simulated).');


    // 3. Synthesize the final result.
    // LARI's core logic would fuse the raw findings from the sub-engine
    // with the risk context from PRECOG's ThreatHypotheses to create a final,
    // user-appropriate narrative or structured report for SCING.
    
    // For now, we will return the direct sub-engine output, with the understanding
    // that this is where the final synthesis would happen.
    const finalSynthesizedOutput = {
        ...subEngineOutput,
        // riskAnalysis: threatHypotheses, // Example of fused data
        synthesis_timestamp: new Date().toISOString(),
        narrative_summary: "LARI has processed the findings and assessed potential risks. Review the detailed results.",
    };

    console.log('LARI Orchestrator: Final synthesis complete.');
    
    return finalSynthesizedOutput;
  }
);
