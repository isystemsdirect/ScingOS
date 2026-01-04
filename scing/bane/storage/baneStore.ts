import type { BaneAuditRecord, BaneEventRecord, BaneIncidentRecord } from './records';

export interface BaneStore {
  appendAudit(record: BaneAuditRecord): Promise<void>;
  appendEvent(event: BaneEventRecord): Promise<void>;
  getRecentAudits(limit: number): Promise<BaneAuditRecord[]>;

  appendIncident?(incident: BaneIncidentRecord): Promise<void>;
  getRecentIncidents?(limit: number): Promise<BaneIncidentRecord[]>;
  getIncidentByTrace?(traceId: string): Promise<BaneIncidentRecord | null>;
}
