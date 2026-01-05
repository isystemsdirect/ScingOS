import type { LariEngineOutput } from '../contracts/lariOutput.schema';
import { validateLariOutput } from '../contracts/validateLariOutput';
import { runCritic } from '../critic/runCritic';
import { applyCritic } from '../critic/applyCritic';

export type EmitObs = (eventName: string, data?: any) => void;

export type EmitEngineOutputResult =
  | { blocked: true; reason: 'SCHEMA_VIOLATION'; errors: string[] }
  | { blocked: false; output: LariEngineOutput };

export function emitEngineOutput(params: {
  output: LariEngineOutput;
  emitObs?: EmitObs;
}): EmitEngineOutputResult {
  const { output, emitObs } = params;

  // 2) validateLariOutput()
  const v1 = validateLariOutput(output);
  if (v1.ok === false) {
    emitObs?.('LARI_OUTPUT_REJECTED', { engineId: output.engineId, errors: v1.errors });
    return { blocked: true, reason: 'SCHEMA_VIOLATION', errors: v1.errors };
  }

  // 3) runCritic()
  const critic = runCritic(output);

  // 4) applyCritic()
  const finalOutput = applyCritic(output, critic);

  // 5) re-validate final output
  const v2 = validateLariOutput(finalOutput);
  if (v2.ok === false) {
    emitObs?.('LARI_OUTPUT_REJECTED', { engineId: finalOutput.engineId, errors: v2.errors });
    return { blocked: true, reason: 'SCHEMA_VIOLATION', errors: v2.errors };
  }

  // 6) emit only if valid
  return { blocked: false, output: finalOutput };
}
