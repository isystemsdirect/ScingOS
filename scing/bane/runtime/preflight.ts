import type { BaneInput, BaneOutput, BaneRuntimeConfig } from '../types';
import { policyForProfile } from '../policy/banePolicy';
import { isLocked } from './riskLedger';
import { checkIntegrity } from './integrity';

function deny(params: {
  traceId: string;
  enforcementLevel: 2 | 3 | 4 | 5;
  message: string;
  id: string;
  title: string;
  rationale: string;
  timingMs: number;
}): BaneOutput {
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

export function banePreflight(config: BaneRuntimeConfig, input: BaneInput, traceId: string, t0: number): BaneOutput | null {
  const hints = policyForProfile(config.profileId);
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

  const integrity = checkIntegrity(input);
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

  if (isLocked(auth.identityId)) {
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
    const caps: string[] = Array.isArray(auth.capabilities) ? auth.capabilities : [];
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
