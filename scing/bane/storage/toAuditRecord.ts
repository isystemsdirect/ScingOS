import type { BaneInput, BaneOutput } from '../types';
import type { BaneAuditRecord } from './records';
import { sha256Hex } from './hash';

export function toAuditRecord(input: BaneInput, out: BaneOutput): BaneAuditRecord {
  const rawText = input.text ?? '';
  const safeText = out.safeText;
  return {
    at: Date.now(),
    traceId: out.traceId,
    route: String(input.req?.route ?? 'unknown'),
    requiredCapability: input.req?.requiredCapability,
    identityId: input.req?.auth?.identityId,
    verdict: out.verdict,
    severity: out.severity,
    enforcementLevel: out.enforcementLevel,
    inputHash: sha256Hex(rawText),
    safeTextHash: typeof safeText === 'string' ? sha256Hex(safeText) : undefined,
    findingsSummary: (out.findings ?? []).map((f) => ({ id: f.id, severity: f.severity, verdict: f.verdict })),
  };
}
