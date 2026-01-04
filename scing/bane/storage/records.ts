import type { BaneEnforcementLevel, BaneSeverity, BaneVerdict } from '../types';

export type BaneAuditRecord = {
  at: number;
  traceId: string;
  route: string;
  requiredCapability?: string;
  identityId?: string;
  verdict: BaneVerdict;
  severity: BaneSeverity;
  enforcementLevel: BaneEnforcementLevel;
  textHash: string;
  findingsSummary: Array<{ id: string; severity: BaneSeverity; verdict: BaneVerdict }>;
};

export type BaneEventRecord = {
  type: string;
  traceId: string;
  at: number;
  data?: Record<string, unknown>;
};

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
