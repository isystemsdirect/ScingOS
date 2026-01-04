import type { BaneOutput } from '../types';

export type BaneIncidentRecord = {
  traceId: string;
  occurredAt: number;
  identityId?: string;
  sessionId?: string;
  ipHash?: string;
  enforcementLevel: number;
  verdict: string;
  severity: string;
  findingsSummary: Array<{ id: string; severity: string; verdict: string }>;
};

export function toIncidentRecord(
  out: BaneOutput,
  ctx?: { identityId?: string; sessionId?: string; ipHash?: string }
): BaneIncidentRecord {
  return {
    traceId: out.traceId,
    occurredAt: Date.now(),
    identityId: ctx?.identityId,
    sessionId: ctx?.sessionId,
    ipHash: ctx?.ipHash,
    enforcementLevel: out.enforcementLevel ?? 0,
    verdict: out.verdict,
    severity: out.severity,
    findingsSummary: (out.findings ?? []).map((f) => ({ id: f.id, severity: f.severity, verdict: f.verdict })),
  };
}
