import { ENGINE_REGISTRY, REGISTRY_VERSION } from './engineRegistry';
import { CONTRACTS } from './engineContracts';
import { RISK } from './engineRisk';
import { VISUAL_BINDINGS } from './engineVisual';
import { topoSort } from './engineGraph';
import { EngineId } from './engineTypes';

export type RegistryValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  registryVersion: string;
  topo: EngineId[];
};

export function validateRegistry(): RegistryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const ids = Object.keys(ENGINE_REGISTRY) as EngineId[];

  // 1) Basic presence checks
  for (const id of ids) {
    if (!CONTRACTS[id]) errors.push(`Missing contract for ${id}`);
    if (!RISK[id]) errors.push(`Missing risk profile for ${id}`);
    if (!VISUAL_BINDINGS[id]) warnings.push(`Missing visual binding for ${id} (will default to neutral in UI logic)`);
  }

  // 2) Dependency existence checks
  for (const id of ids) {
    for (const dep of ENGINE_REGISTRY[id].dependsOn) {
      if (!ENGINE_REGISTRY[dep]) errors.push(`Engine ${id} depends on missing engine ${dep}`);
    }
  }

  // 3) Stage/key sanity
  for (const id of ids) {
    const e = ENGINE_REGISTRY[id];
    if (e.tier === 'key' || e.tier === 'roadmap') {
      if (!e.providesKeys || e.providesKeys.length === 0) warnings.push(`${id} is ${e.tier} but providesKeys is empty`);
    }
  }

  // 4) Deterministic ordering
  let topo: EngineId[] = [];
  try {
    topo = topoSort();
  } catch (err: any) {
    errors.push(String(err?.message ?? err));
  }

  return { ok: errors.length === 0, errors, warnings, registryVersion: REGISTRY_VERSION, topo };
}
