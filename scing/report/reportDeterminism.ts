export type ReportSection =
  | 'overview'
  | 'scope'
  | 'site'
  | 'evidence_summary'
  | 'findings'
  | 'prism_graph'
  | 'classifications'
  | 'maps'
  | 'appendix';

export function stableSort<T>(items: T[], key: (x: T) => string): T[] {
  return [...items].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

export function stableSeverityRank(sev: string): number {
  if (sev === 'critical') return 0;
  if (sev === 'major') return 1;
  if (sev === 'minor') return 2;
  return 3;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function stableJsonDeep(obj: unknown): string {
  const seen = new Set<unknown>();
  const walk = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    if (seen.has(v)) return '[Circular]';
    seen.add(v);

    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (isPlainObject(v)) {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(v).sort()) out[k] = walk(v[k]);
      return out;
    }
    return v;
  };
  return JSON.stringify(walk(obj));
}
