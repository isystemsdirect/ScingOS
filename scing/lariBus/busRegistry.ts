import type { EngineContract, EngineId } from './busTypes';

export const ENGINE_REGISTRY: Record<EngineId, EngineContract> = {} as any;

export function registerEngine(contract: EngineContract) {
  (ENGINE_REGISTRY as any)[contract.engineId] = contract;
}

export function getEngine(engineId: EngineId): EngineContract {
  const e = (ENGINE_REGISTRY as any)[engineId];
  if (!e) throw new Error(`Engine not registered: ${engineId}`);
  return e;
}

export function listEngines(): EngineContract[] {
  return Object.values(ENGINE_REGISTRY as any);
}
