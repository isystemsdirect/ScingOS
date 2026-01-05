"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.banePreflight = banePreflight;
const banePolicy_1 = require("../policy/banePolicy");
const riskLedger_1 = require("./riskLedger");
const integrity_1 = require("./integrity");
const containment_1 = require("./containment");
function deny(params) {
    return {
        verdict: 'deny',
        severity: 'high',
        findings: [
            {
                id: params.id,
                title: params.title,
                severity: 'high',
                verdict: 'deny',
                rationale: params.rationale,
                tags: ['preflight'],
            },
        ],
        traceId: params.traceId,
        timingMs: params.timingMs,
        enforcementLevel: params.enforcementLevel,
        publicMessage: params.message,
    };
}
function banePreflight(config, input, traceId, t0) {
    const hints = (0, banePolicy_1.policyForProfile)(config.profileId);
    const lockdown = (0, containment_1.isGlobalLockdown)();
    if (lockdown.active) {
        return {
            verdict: 'deny',
            severity: 'critical',
            enforcementLevel: 5,
            publicMessage: 'System temporarily unavailable due to a security event.',
            findings: [
                {
                    id: 'GLOBAL_LOCKDOWN',
                    title: 'Global containment active',
                    severity: 'critical',
                    verdict: 'deny',
                    rationale: 'Emergency containment mode is active.',
                    tags: ['containment', 'global', 'preflight'],
                },
            ],
            traceId,
            timingMs: Date.now() - t0,
        };
    }
    const auth = input.req?.auth;
    const requiredCapability = input.req?.requiredCapability;
    if (!auth?.identityId) {
        return deny({
            traceId,
            enforcementLevel: 2,
            message: 'Request denied: unauthorized or unsafe operation. This attempt has been logged.',
            id: 'NO_AUTH',
            title: 'Authentication missing',
            rationale: 'No authenticated identity was provided.',
            timingMs: Date.now() - t0,
        });
    }
    const integrity = (0, integrity_1.checkIntegrity)(input);
    if (integrity.ok === false && integrity.code === 'REPLAY') {
        return deny({
            traceId,
            enforcementLevel: 4,
            message: 'Access revoked temporarily due to policy violations. Contact an authorized administrator.',
            id: 'REPLAY_DETECTED',
            title: 'Replay detected',
            rationale: 'Request nonce has been seen recently.',
            timingMs: Date.now() - t0,
        });
    }
    if ((0, riskLedger_1.isLocked)(auth.identityId)) {
        return {
            verdict: 'deny',
            severity: 'high',
            findings: [
                {
                    id: 'IDENTITY_LOCKED',
                    title: 'Identity temporarily locked',
                    severity: 'high',
                    verdict: 'deny',
                    rationale: 'Prior violations triggered an automatic lockout.',
                    tags: ['lockout', 'preflight'],
                },
            ],
            traceId,
            timingMs: Date.now() - t0,
            enforcementLevel: 4,
            publicMessage: 'Access revoked temporarily due to policy violations. Contact an authorized administrator.',
        };
    }
    if (requiredCapability) {
        const caps = Array.isArray(auth.capabilities) ? auth.capabilities : [];
        if (!caps.includes(requiredCapability)) {
            return deny({
                traceId,
                enforcementLevel: 3,
                message: 'Request denied: unauthorized or unsafe operation. This attempt has been logged.',
                id: 'MISSING_CAPABILITY',
                title: 'Insufficient capability',
                rationale: 'Authenticated identity lacks required capability.',
                timingMs: Date.now() - t0,
            });
        }
    }
    if (hints.strictMode) {
        const si = auth.sessionIntegrity;
        const ok = Boolean(si?.nonceOk) && Boolean(si?.signatureOk) && Boolean(si?.tokenFresh);
        if (!ok) {
            return deny({
                traceId,
                enforcementLevel: 3,
                message: 'Request denied: unauthorized or unsafe operation. This attempt has been logged.',
                id: 'SESSION_INTEGRITY_FAILED',
                title: 'Session integrity validation failed',
                rationale: 'Session integrity checks were missing or invalid.',
                timingMs: Date.now() - t0,
            });
        }
    }
    return null;
}
//# sourceMappingURL=preflight.js.map