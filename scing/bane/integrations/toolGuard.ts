import type { BaneInput } from '../types';
import type { BaneRuntimeConfig } from '../runtime/config';
import { createLiveBaneEngine } from '../runtime/liveBaneEngine';

export type ToolCallContext = {
  toolName: string;
  payloadText: string;
  identityId?: string;
  sessionId?: string;
  ipHash?: string;
  capabilities?: string[];
  sessionIntegrity?: { nonceOk?: boolean; signatureOk?: boolean; tokenFresh?: boolean };
  requiredCapability: string;
};

export type ToolGuardDecision =
  | { ok: true; traceId: string }
  | { ok: false; traceId: string; message: string };

export function makeBaneToolGuard(config: BaneRuntimeConfig) {
  const engine = createLiveBaneEngine(config);

  return function guard(ctx: ToolCallContext): ToolGuardDecision {
    const input: BaneInput = {
      text: ctx.payloadText,
      req: {
        route: `tool:${ctx.toolName}`,
        requiredCapability: ctx.requiredCapability,
        auth: {
          identityId: ctx.identityId,
          sessionId: ctx.sessionId,
          ipHash: ctx.ipHash,
          capabilities: ctx.capabilities,
          isAuthenticated: Boolean(ctx.identityId),
          sessionIntegrity: ctx.sessionIntegrity,
        },
      },
    };

    const out = engine.evaluate(input);
    if (out.verdict === 'deny' || out.verdict === 'review') {
      return { ok: false, traceId: out.traceId, message: out.publicMessage ?? 'Tool invocation blocked by policy.' };
    }

    return { ok: true, traceId: out.traceId };
  };
}
