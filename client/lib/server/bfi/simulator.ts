import type { IntentState } from "./intentLedger";

export type SimulationOutput = {
  affectedFiles: string[];
  affectedEngines: string[];
  affectedPolicies?: string[];
  estimatedRisk: string;
  confidenceScore: number;
  explanation?: string;
};

export async function simulateImpact(_repoRoot: string, intent: IntentState): Promise<SimulationOutput> {
  return {
    affectedFiles: [],
    affectedEngines: [],
    affectedPolicies: [],
    estimatedRisk: "low",
    confidenceScore: 0.75,
    explanation: `stub simulation for intent: ${intent.id}`,
  };
}
