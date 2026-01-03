import { sha256Hex } from './evidenceHash';

export function computeEventHash(payload: any): string {
  return sha256Hex(JSON.stringify(payload));
}

export function nextWormRef(
  prev: { thisHash: string; index: number } | null,
  scope: 'inspection' | 'artifact' | 'org',
  scopeId: string,
  eventPayload: any
) {
  const prevHash = prev?.thisHash;
  const index = (prev?.index ?? 0) + 1;
  const thisHash = computeEventHash({ scope, scopeId, prevHash, index, eventPayload });
  return { scope, scopeId, prevHash, thisHash, index };
}
