import type { BusContext, EngineContract, EngineInput, EngineOutput } from './busTypes';
import { allowEngineRun } from './busPolicy';

export async function dispatchToEngine(
  ctx: BusContext,
  engine: EngineContract,
  input: EngineInput
): Promise<EngineOutput[]> {
  const decisions = engine.gates.map((g) => ctx.entitlements(g));
  const gate = allowEngineRun(engine, decisions);
  if (!gate.allow) {
    return [
      {
        kind: 'log',
        level: 'warn',
        message: `Engine gated: ${engine.engineId}`,
        data: { reasons: gate.reasons },
      },
    ];
  }
  return await engine.handle(ctx, input);
}

export function emitAll(ctx: BusContext, outputs: EngineOutput[]) {
  outputs.forEach((o) => ctx.emit(o));
}
