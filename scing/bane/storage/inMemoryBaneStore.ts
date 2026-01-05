import type { BaneStore } from './baneStore';
import type { BaneAuditRecord, BaneEventRecord, BaneIncidentRecord } from './records';

export class InMemoryBaneStore implements BaneStore {
  private audits: BaneAuditRecord[] = [];
  private events: BaneEventRecord[] = [];
  private incidents: BaneIncidentRecord[] = [];

  async appendAudit(record: BaneAuditRecord): Promise<void> {
    this.audits.push(record);
  }

  async appendEvent(event: BaneEventRecord): Promise<void> {
    this.events.push(event);
  }

  async getRecentAudits(limit: number): Promise<BaneAuditRecord[]> {
    return this.audits
      .slice()
      .sort((a, b) => b.at - a.at)
      .slice(0, Math.max(1, Math.min(200, limit)));
  }

  async appendIncident(incident: BaneIncidentRecord): Promise<void> {
    this.incidents.push(incident);
  }

  async getRecentIncidents(limit: number): Promise<BaneIncidentRecord[]> {
    return this.incidents
      .slice()
      .sort((a, b) => b.occurredAt - a.occurredAt)
      .slice(0, Math.max(1, Math.min(200, limit)));
  }

  async getIncidentByTrace(traceId: string): Promise<BaneIncidentRecord | null> {
    return this.incidents.find((i) => i.traceId === traceId) ?? null;
  }
}
