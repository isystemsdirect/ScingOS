export type BaneAuditAction =
  | 'ENTITLEMENT_ISSUE'
  | 'ENTITLEMENT_RENEW'
  | 'ENTITLEMENT_REVOKE'
  | 'DEVICE_BIND'
  | 'DEVICE_REVOKE'
  | 'SNAPSHOT_ISSUE'
  | 'SNAPSHOT_REVOKE';

export type BaneAuditEvent = {
  ts: string;
  orgId: string;
  actorUid: string;
  targetUid?: string;
  action: BaneAuditAction;
  before?: any;
  after?: any;
  traceId?: string;
  ip?: string;
  userAgent?: string;
};
