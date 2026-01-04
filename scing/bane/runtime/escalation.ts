import type { BaneEnforcementLevel, BaneSeverity } from '../types';
import { recordStrike, lockIdentity } from './riskLedger';

export function escalate(identityId: string, severity: BaneSeverity): BaneEnforcementLevel {
  const rec = recordStrike(identityId, severity);

  if (severity === 'critical') {
    lockIdentity(identityId, 60 * 60 * 1000);
    return 5;
  }

  if (rec.strikes >= 3) {
    lockIdentity(identityId, 15 * 60 * 1000);
    return 4;
  }

  if (rec.strikes === 2) {
    return 3;
  }

  return 2;
}
