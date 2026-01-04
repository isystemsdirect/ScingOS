import type { BaneSeverity } from '../types';

export type RiskRecord = {
  identityId: string;
  strikes: number;
  lastSeverity: BaneSeverity;
  lastSeen: number;
  lockedUntil?: number;
};

const ledger = new Map<string, RiskRecord>();

export function recordStrike(identityId: string, severity: BaneSeverity, now = Date.now()): RiskRecord {
  const prev = ledger.get(identityId);
  const strikes = (prev?.strikes ?? 0) + 1;

  const rec: RiskRecord = {
    identityId,
    strikes,
    lastSeverity: severity,
    lastSeen: now,
    lockedUntil: prev?.lockedUntil,
  };

  ledger.set(identityId, rec);
  return rec;
}

export function isLocked(identityId: string, now = Date.now()): boolean {
  const rec = ledger.get(identityId);
  if (!rec?.lockedUntil) return false;
  return now < rec.lockedUntil;
}

export function lockIdentity(identityId: string, ttlMs: number, now = Date.now()) {
  const rec = ledger.get(identityId) ?? {
    identityId,
    strikes: 0,
    lastSeverity: 'high' as BaneSeverity,
    lastSeen: now,
  };
  rec.lockedUntil = now + Math.max(0, ttlMs);
  ledger.set(identityId, rec);
}

export function unlockIdentity(identityId: string) {
  const rec = ledger.get(identityId);
  if (!rec) return;
  delete rec.lockedUntil;
  ledger.set(identityId, rec);
}
