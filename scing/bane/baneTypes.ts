export type BaneKey =
  | 'vision'
  | 'mapper'
  | 'dose'
  | 'prism'
  | 'echo'
  | 'gis'
  | 'weatherbot'
  | 'control'
  | 'therm'
  | 'nose'
  | 'sonic'
  | 'ground'
  | 'aegis'
  | 'eddy';

export type Stage = 'A' | 'B' | 'NA';
export type EntitlementStatus = 'active' | 'grace' | 'expired' | 'revoked';

export type OrgRole = 'owner' | 'admin' | 'manager' | 'inspector' | 'viewer';

export type Entitlement = {
  uid: string;
  orgId: string;
  key: BaneKey;
  stage: Stage;
  status: EntitlementStatus;
  issuedAt: string; // ISO
  expiresAt: string; // ISO
  graceUntil?: string; // ISO optional
  seatBound: boolean;
  deviceBound: boolean;
  allowedDeviceIds?: string[];
  caps: string[];
  policyVersion: number;
  updatedAt: string; // ISO
};

export type PolicyConstraints = {
  offlineAllowed: boolean;
  offlineHardDenyExternalHardware: boolean;
  offlineHardDenyPhysicalControl: boolean;
  maxOfflineSeconds: number; // TTL guardrails
};

export type PolicySnapshot = {
  uid: string;
  orgId: string;
  issuedAt: string; // ISO
  expiresAt: string; // ISO
  policyVersion: number;
  roles: { [uid: string]: OrgRole };
  entitlements: { [K in BaneKey]?: Omit<Entitlement, 'orgId'> };
  constraints: PolicyConstraints;
  hash: string;
  signature: {
    alg: 'HS256' | 'RS256' | 'EdDSA';
    kid: string;
    sig: string; // base64url
  };
};

export type EntitlementDecision = {
  allow: boolean;
  reason:
    | 'OK'
    | 'NO_AUTH'
    | 'NO_ORG'
    | 'NO_ROLE'
    | 'NO_ENTITLEMENT'
    | 'EXPIRED'
    | 'REVOKED'
    | 'STAGE_INSUFFICIENT'
    | 'DEVICE_NOT_ALLOWED'
    | 'OFFLINE_POLICY_MISSING'
    | 'OFFLINE_POLICY_EXPIRED'
    | 'OFFLINE_DENY_EXTERNAL'
    | 'OFFLINE_DENY_CONTROL';
  key: BaneKey;
  requiredStage?: Stage;
  effectiveStage?: Stage;
  capsGranted?: string[];
  policyVersion?: number;
};
