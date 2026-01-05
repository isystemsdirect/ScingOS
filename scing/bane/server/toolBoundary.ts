import { baneToolGuard } from './baneGuards';

export async function runGuardedTool<T>(params: {
  toolName: string;
  requiredCapability: string;
  payloadText: string;
  identityId?: string;
  capabilities?: string[];
  exec: () => Promise<T>;
}): Promise<T> {
  const decision = baneToolGuard({
    toolName: params.toolName,
    requiredCapability: params.requiredCapability,
    payloadText: params.payloadText,
    identityId: params.identityId,
    capabilities: params.capabilities,
    sessionIntegrity: {
      nonceOk: true,
      signatureOk: true,
      tokenFresh: Boolean(params.identityId),
    },
  });

  if (!decision.ok) {
    const msg = 'message' in decision ? String((decision as any).message) : 'Tool invocation blocked by policy.';
    const err = new Error(msg);
    (err as any).baneTraceId = decision.traceId;
    throw err;
  }

  return params.exec();
}
