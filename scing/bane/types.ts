export type BaneVerdict = 'allow' | 'sanitize' | 'review' | 'deny';
export type BaneSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BaneEnforcementLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type BaneAuthContext = {
  identityId?: string;
  sessionId?: string;
  ipHash?: string;
  capabilities?: string[];
  isAuthenticated?: boolean;
  nonce?: string;
  signature?: string;
  issuedAtEpochMs?: number;
  sessionIntegrity?: {
    nonceOk?: boolean;
    signatureOk?: boolean;
    tokenFresh?: boolean;
  };
};

export type BaneRequestContext = {
  route?: string;
  requiredCapability?: string;
  auth?: BaneAuthContext;
};

export type BaneInput = {
  text: string;
  req?: BaneRequestContext;
};

export type BaneFinding = {
  id: string;
  title: string;
  severity: BaneSeverity;
  verdict: BaneVerdict;
  rationale: string;
  tags?: string[];
  evidence?: string;
};

export type BaneOutput = {
  verdict: BaneVerdict;
  severity: BaneSeverity;
  findings: BaneFinding[];
  redactions?: Array<{ start: number; end: number; label: string }>;
  safeText?: string;
  traceId: string;
  timingMs: number;
  enforcementLevel: BaneEnforcementLevel;
  publicMessage?: string;
  throttle?:
    | { action: 'none' }
    | { action: 'delay'; delayMs: number }
    | { action: 'block'; retryAfterMs: number };
};
