"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordStrike = recordStrike;
exports.isLocked = isLocked;
exports.lockIdentity = lockIdentity;
exports.unlockIdentity = unlockIdentity;
const ledger = new Map();
function recordStrike(identityId, severity, now = Date.now()) {
    const prev = ledger.get(identityId);
    const strikes = (prev?.strikes ?? 0) + 1;
    const rec = {
        identityId,
        strikes,
        lastSeverity: severity,
        lastSeen: now,
        lockedUntil: prev?.lockedUntil,
    };
    ledger.set(identityId, rec);
    return rec;
}
function isLocked(identityId, now = Date.now()) {
    const rec = ledger.get(identityId);
    if (!rec?.lockedUntil)
        return false;
    return now < rec.lockedUntil;
}
function lockIdentity(identityId, ttlMs, now = Date.now()) {
    const rec = ledger.get(identityId) ?? {
        identityId,
        strikes: 0,
        lastSeverity: 'high',
        lastSeen: now,
    };
    rec.lockedUntil = now + Math.max(0, ttlMs);
    ledger.set(identityId, rec);
}
function unlockIdentity(identityId) {
    const rec = ledger.get(identityId);
    if (!rec)
        return;
    delete rec.lockedUntil;
    ledger.set(identityId, rec);
}
//# sourceMappingURL=riskLedger.js.map