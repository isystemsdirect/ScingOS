import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { baneHttpGuard } from '../../../../scing/bane/server/baneGuards';

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return '';
  }
}

function capsForRole(role: string | undefined): string[] {
  const r = (role ?? '').toLowerCase();
  if (r === 'admin') return ['bane:invoke', 'tool:db_read', 'tool:db_write', 'tool:external_call'];
  if (r === 'inspector') return ['bane:invoke', 'tool:db_read', 'tool:db_write'];
  if (r === 'viewer') return ['bane:invoke', 'tool:db_read'];
  return ['bane:invoke'];
}

async function resolveRoleFromFirestore(uid: string): Promise<string | undefined> {
  const snap = await admin.firestore().collection('users').doc(uid).get();
  const role = snap.exists ? (snap.data() as any)?.role : undefined;
  return typeof role === 'string' ? role : undefined;
}

export async function resolveCapabilities(params: {
  uid: string;
  token?: Record<string, unknown>;
}): Promise<string[]> {
  const tokenRole = typeof (params.token as any)?.role === 'string' ? String((params.token as any).role) : undefined;
  const tokenCaps = Array.isArray((params.token as any)?.caps) ? ((params.token as any).caps as unknown[]).map(String) : null;
  if (tokenCaps && tokenCaps.length > 0) return ['bane:invoke', ...tokenCaps];

  const role = tokenRole ?? (await resolveRoleFromFirestore(params.uid));
  return capsForRole(role);
}

export async function enforceBaneCallable(params: {
  name: string;
  data: unknown;
  ctx: functions.https.CallableContext;
}): Promise<{ traceId: string; uid: string; capabilities: string[] }> {
  const uid = params.ctx.auth?.uid;

  // Run BANE even on unauthenticated attempts (fail-closed + traceId).
  if (!uid) {
    const decision = baneHttpGuard({
      path: `fn:${params.name}`,
      bodyText: safeJson(params.data),
      identityId: undefined,
      capabilities: undefined,
      sessionIntegrity: { nonceOk: false, signatureOk: false, tokenFresh: false },
    });

    const traceId = decision.ok ? 'unknown' : decision.traceId;
    throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH', { traceId });
  }

  const capabilities = await resolveCapabilities({ uid, token: (params.ctx.auth as any)?.token });

  const decision = baneHttpGuard({
    path: `fn:${params.name}`,
    bodyText: safeJson(params.data),
    identityId: uid,
    capabilities,
    sessionIntegrity: { nonceOk: true, signatureOk: true, tokenFresh: true },
  });

  if (!decision.ok) {
    const code = decision.retryAfterMs ? 'resource-exhausted' : 'permission-denied';
    throw new functions.https.HttpsError(code as any, decision.message, {
      traceId: decision.traceId,
      retryAfterMs: decision.retryAfterMs ?? null,
    });
  }

  return { traceId: decision.traceId, uid, capabilities };
}

export function enforceBaneHttp(params: {
  req: functions.https.Request;
  res: functions.Response<any>;
  name: string;
  identityId?: string;
  capabilities?: string[];
  bodyText?: string;
}): { ok: true; traceId: string } | { ok: false } {
  const headers: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(params.req.headers)) {
    headers[k] = Array.isArray(v) ? v[0] : v;
  }

  const decision = baneHttpGuard({
    path: params.req.path ? String(params.req.path) : `http:${params.name}`,
    headers,
    bodyText: params.bodyText ?? '',
    identityId: params.identityId,
    capabilities: params.capabilities,
    sessionIntegrity: params.identityId
      ? { nonceOk: true, signatureOk: true, tokenFresh: true }
      : { nonceOk: false, signatureOk: false, tokenFresh: false },
  });

  if (!decision.ok) {
    params.res.setHeader('x-bane-trace-id', decision.traceId);
    if (decision.retryAfterMs) {
      params.res.setHeader('retry-after', String(Math.ceil(decision.retryAfterMs / 1000)));
    }
    params.res.status(decision.status).json({ ok: false, message: decision.message, traceId: decision.traceId });
    return { ok: false };
  }

  params.res.setHeader('x-bane-trace-id', decision.traceId);
  return { ok: true, traceId: decision.traceId };
}
