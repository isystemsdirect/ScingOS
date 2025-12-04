
// audit.ts
import crypto from 'crypto';
import type { Decision } from './decision';

export interface AuditRecord {
  id: string;
  decision: Decision;
  actor: string;
  resource: string;
  timestamp: string;
  hash: string;
}

export class Audit {
  constructor(private appendToLog: (record: AuditRecord) => Promise<void>) {}

  async createSignedSDR(
    decision: Decision,
    actor: string,
    resource: string
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({ decision, actor, resource, timestamp });
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    const record: AuditRecord = {
      id: crypto.randomUUID(),
      decision,
      actor,
      resource,
      timestamp,
      hash,
    };

    await this.appendToLog(record);

    // In a real system, sign hash with hardware-backed key (Secure Enclave / HSM)
    return hash;
  }
}
