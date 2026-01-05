import type { PolicySnapshot } from './baneTypes';

declare const require: any;

function isPlainObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function stableJson(obj: any): string {
  const seen = new Set<any>();

  const walk = (v: any): any => {
    if (v === null || typeof v !== 'object') return v;
    if (seen.has(v)) return '[Circular]';
    seen.add(v);

    if (Array.isArray(v)) return v.map(walk);
    if (isPlainObject(v)) {
      const out: Record<string, any> = {};
      for (const k of Object.keys(v).sort()) out[k] = walk(v[k]);
      return out;
    }
    return v;
  };

  return JSON.stringify(walk(obj));
}

export function sha256Hex(s: string): string {
  // Node fast-path.
  try {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(s).digest('hex');
  } catch {
    // Minimal fallback: not available.
    throw new Error('SHA256_UNAVAILABLE');
  }
}

export function computeSnapshotHash(
  snapshotUnsigned: Omit<PolicySnapshot, 'hash' | 'signature'>
): string {
  return sha256Hex(stableJson(snapshotUnsigned));
}
