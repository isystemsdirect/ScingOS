// context.ts
export type UserRole = 'INSPECTOR' | 'ADMIN' | 'AUDITOR' | 'SYSTEM';

export type DevicePosture = 'HEALTHY' | 'DEGRADED' | 'ROOTED' | 'UNKNOWN';

export interface Context {
  subject: string;          // e.g. "scing-orchestrator", "lari-vision"
  userRole: UserRole;
  inspectionId?: string;
  devicePosture: DevicePosture;
  clientId?: string;        // tenant / customer
  traceId?: string;         // for correlation
}
