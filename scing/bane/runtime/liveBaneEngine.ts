import crypto from 'node:crypto';

import type { BaneInput, BaneOutput, BaneRuntimeConfig } from '../types';
import { policyForProfile } from '../policy/banePolicy';
import { baselineDetectors } from '../core/detectors.baseline';
import { runDetectors } from '../core/detectors';
import { aggregate } from '../core/aggregate';
import { sortFindings } from '../core/sortFindings';
import { applyRedactions } from '../core/redaction';
import { redactionsFromFindings } from '../core/redactionFromFindings';
import { banePreflight } from './preflight';
import { escalate } from './escalation';
import { noteHostileAttempt, decideThrottle } from './throttle';
import { toIncidentRecord } from './incident';
import { normalizeForDetection } from './normalize';
import { finalizePublicFacing } from './publicResponse';
import { safeSideEffects } from './safeSideEffects';

function traceIdFromEntropy(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
}

function publicMessageFor(params: { verdict: BaneOutput['verdict']; enforcementLevel: number }): string | undefined {
  if (params.verdict === 'deny') {
    return params.enforcementLevel >= 4
      ? 'Access revoked temporarily due to policy violations. Contact an authorized administrator.'
      : 'Request denied: unauthorized or unsafe operation. This attempt has been logged.';
  }
  if (params.verdict === 'review') {
    return 'Request restricted by policy. Additional authorization is required.';
  }
  return undefined;
}

export function createLiveBaneEngine(config: BaneRuntimeConfig) {
  const hints = policyForProfile(config.profileId);

  return {
    evaluate(input: BaneInput): BaneOutput {
      const t0 = Date.now();
      const traceId = traceIdFromEntropy();

      const normalized = normalizeForDetection(input);

      const pre = banePreflight(config, input, traceId, t0);
      if (pre) {
        const auth = input.req?.auth;
        if (pre.verdict === 'deny') {
          noteHostileAttempt({ identityId: auth?.identityId, ipHash: auth?.ipHash });
          const throttle = decideThrottle({ identityId: auth?.identityId, ipHash: auth?.ipHash });
          pre.throttle = throttle;
        }

        pre.findings = sortFindings(pre.findings);
        const final = finalizePublicFacing(pre);
        safeSideEffects(config, input, final);
        return final;
      }

      const detectors = baselineDetectors();
      const rawFindings = runDetectors(detectors, normalized.forDetection, hints);
      const findings = sortFindings(rawFindings);
      const agg = aggregate(findings);

      let enforcementLevel: BaneOutput['enforcementLevel'] =
        agg.verdict === 'deny' ? 3 : agg.verdict === 'review' ? 2 : agg.verdict === 'sanitize' ? 1 : 0;

      const identityId = input.req?.auth?.identityId;
      if (agg.verdict === 'deny' && identityId && hints.escalationEnabled) {
        enforcementLevel = escalate(identityId, agg.severity);
      }

      const spans = redactionsFromFindings(input.text, findings);
      const safeText =
        (agg.verdict === 'sanitize' || agg.verdict === 'review') && spans.length
          ? applyRedactions(input.text, spans)
          : undefined;

      const out: BaneOutput = {
        verdict: agg.verdict,
        severity: agg.severity,
        findings,
        redactions: spans.length ? spans : undefined,
        safeText,
        traceId,
        timingMs: Date.now() - t0,
        enforcementLevel,
        publicMessage: publicMessageFor({ verdict: agg.verdict, enforcementLevel }),
      };

      if (out.verdict === 'deny') {
        noteHostileAttempt({ identityId, ipHash: input.req?.auth?.ipHash });
        out.throttle = decideThrottle({ identityId, ipHash: input.req?.auth?.ipHash });
      }

      if (out.enforcementLevel === 5 && hints.incidentOnCritical) {
        const incident = toIncidentRecord(out, {
          identityId,
          sessionId: input.req?.auth?.sessionId,
          ipHash: input.req?.auth?.ipHash,
        });
        try {
          void config.store?.appendIncident?.(incident as any).catch(() => {});
        } catch {
          // swallow
        }
      }

      const final = finalizePublicFacing(out);
      safeSideEffects(config, input, final);
      return final;
    },
  };
}
