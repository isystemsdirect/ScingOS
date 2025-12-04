// decision.ts
export type DecisionType = 'ALLOW' | 'DENY' | 'QUARANTINE' | 'ROLLBACK';

export interface Decision {
  type: DecisionType;
  reasonCode: string;       // e.g. "DOMAIN_NOT_ALLOWLISTED"
  reasonDetail?: string;
  mode: 'NORMAL' | 'DEMON';
}
