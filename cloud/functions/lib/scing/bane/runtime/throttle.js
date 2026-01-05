"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteHostileAttempt = noteHostileAttempt;
exports.decideThrottle = decideThrottle;
const state = new Map();
function key(identityId, ipHash) {
    return identityId ? `id:${identityId}` : ipHash ? `ip:${ipHash}` : 'anon';
}
function noteHostileAttempt(params) {
    const now = params.now ?? Date.now();
    const k = key(params.identityId, params.ipHash);
    const prev = state.get(k);
    const strikes = (prev?.strikes ?? 0) + 1;
    const next = { strikes, lastAt: now };
    state.set(k, next);
    return next;
}
function decideThrottle(params) {
    const now = params.now ?? Date.now();
    const k = key(params.identityId, params.ipHash);
    const s = state.get(k);
    if (!s)
        return { action: 'none' };
    const delayMs = Math.min(250 * Math.pow(2, Math.max(0, s.strikes - 1)), 8000);
    const delta = now - s.lastAt;
    if (delta < 250 && s.strikes >= 3) {
        return { action: 'block', retryAfterMs: 15000 };
    }
    return delayMs >= 500 ? { action: 'delay', delayMs } : { action: 'none' };
}
//# sourceMappingURL=throttle.js.map