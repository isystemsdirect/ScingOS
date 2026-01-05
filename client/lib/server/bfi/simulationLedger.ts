import type { IntentState } from "./intentLedger";
import type { SimulationOutput } from "./simulator";

export type SimulationRecord = {
  simulationHash: string;
  intentId: string;
  output: SimulationOutput;
};

export async function persistSimulation(_repoRoot: string, intent: IntentState, output: SimulationOutput): Promise<SimulationRecord> {
  return {
    simulationHash: `sim_${intent.id}_${Date.now()}`,
    intentId: intent.id,
    output,
  };
}
