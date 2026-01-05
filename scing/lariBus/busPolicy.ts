import type { EngineContract } from './busTypes';

export function allowEngineRun(
  contract: EngineContract,
  decisions: any[]
): { allow: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const deny = decisions.find((d) => !d.allow);
  if (deny) reasons.push(`${deny.key}:${deny.reason}`);
  return { allow: !deny, reasons };
}
