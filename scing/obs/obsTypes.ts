export type ObsSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type ObsScope =
  | 'client'
  | 'function'
  | 'bus'
  | 'engine'
  | 'inspection'
  | 'evidence'
  | 'report'
  | 'export'
  | 'auth'
  | 'security';

export type ObsEvent = {
  eventId: string;
  createdAt: string;
  orgId?: string;
  uid?: string;
  deviceId?: string;

  severity: ObsSeverity;
  scope: ObsScope;

  correlationId: string;
  inspectionId?: string;
  engineId?: string;
  phase?: string; // e.g., LFCB-07, LFCB-10

  message: string;
  errorName?: string;
  errorStack?: string;

  tags?: string[];
  meta?: any;

  // transport flags
  offlineCaptured?: boolean;
  flushedAt?: string;
};
