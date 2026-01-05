import type { BaneInput } from '../types';
import type { BaneRuntimeConfig } from '../runtime/config';
import { createLiveBaneEngine } from '../runtime/liveBaneEngine';

export type BaneHttpRequest = {
  path?: string;
  headers?: Record<string, string | undefined>;
  bodyText?: string;
  identityId?: string;
  sessionId?: string;
  ipHash?: string;
  capabilities?: string[];
  sessionIntegrity?: { nonceOk?: boolean; signatureOk?: boolean; tokenFresh?: boolean };
};

export type BaneHttpDecision =
  | { ok: true; traceId: string }
  | { ok: false; status: number; message: string; traceId: string; retryAfterMs?: number };

export function makeBaneHttpGuard(config: BaneRuntimeConfig) {
  const engine = createLiveBaneEngine(config);

  return function guard(req: BaneHttpRequest): BaneHttpDecision {
    const input: BaneInput = {
      text: req.bodyText ?? '',
      req: {
        route: req.path ?? 'http:unknown',
        requiredCapability: 'bane:invoke',
        auth: {
          identityId: req.identityId,
          sessionId: req.sessionId,
          ipHash: req.ipHash,
          capabilities: req.capabilities,
          isAuthenticated: Boolean(req.identityId),
          sessionIntegrity: req.sessionIntegrity,
        },
      },
    };

    const out = engine.evaluate(input);

    if (out.verdict === 'deny') {
      const status = out.enforcementLevel === 4 ? 423 : out.enforcementLevel === 5 ? 403 : 403;
      return {
        ok: false,
        status,
        message: out.publicMessage ?? 'Access denied by policy.',
        traceId: out.traceId,
        retryAfterMs: out.throttle && out.throttle.action === 'block' ? out.throttle.retryAfterMs : undefined,
      };
    }

    if (out.verdict === 'review') {
      return {
        ok: false,
        status: 401,
        message: out.publicMessage ?? 'Additional authorization required.',
        traceId: out.traceId,
      };
    }

    return { ok: true, traceId: out.traceId };
  };
}
