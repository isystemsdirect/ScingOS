import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { maybeNotifyGitHubOnCritical } from './githubNotify';
import { enforceBaneCallable } from '../bane/enforce';
import { runGuardedTool } from '../../../../scing/bane/server/toolBoundary';

const SECRET_KEYS = new Set([
  'password',
  'pass',
  'token',
  'idToken',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'privateKey',
  'authorization',
]);

function redact(value: any): any {
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/g, 'Bearer [REDACTED]');
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      if (SECRET_KEYS.has(k)) out[k] = '[REDACTED]';
      else out[k] = redact(v);
    }
    return out;
  }
  return value;
}

export const writeObsEvent = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'writeObsEvent', data, ctx });
  const uid = gate.uid;

  const evt = data?.event;
  if (
    !evt?.eventId ||
    !evt?.createdAt ||
    !evt?.severity ||
    !evt?.scope ||
    !evt?.correlationId ||
    !evt?.message
  ) {
    throw new functions.https.HttpsError('invalid-argument', 'BAD_EVENT');
  }

  // Minimize sensitive fields server-side as a second-pass defense
  const sanitized = {
    eventId: String(evt.eventId),
    createdAt: String(evt.createdAt),
    orgId: evt.orgId ? String(evt.orgId) : null,
    uid,
    deviceId: evt.deviceId ? String(evt.deviceId) : null,
    severity: String(evt.severity),
    scope: String(evt.scope),
    correlationId: String(evt.correlationId),
    inspectionId: evt.inspectionId ? String(evt.inspectionId) : null,
    engineId: evt.engineId ? String(evt.engineId) : null,
    phase: evt.phase ? String(evt.phase) : null,
    message: String(evt.message).slice(0, 2000),
    errorName: evt.errorName ? String(evt.errorName).slice(0, 200) : null,
    errorStack: evt.errorStack ? String(evt.errorStack).slice(0, 12000) : null,
    tags: Array.isArray(evt.tags) ? evt.tags.slice(0, 20).map(String) : [],
    meta: redact(evt.meta ?? null),
    flushedAt: evt.flushedAt ? String(evt.flushedAt) : null,
  };

  const db = admin.firestore();
  try {
    await runGuardedTool({
      toolName: 'firestore_write',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'set', path: `obs/events/${sanitized.eventId}` }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () => db.doc(`obs/events/${sanitized.eventId}`).set(sanitized, { merge: false }),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }

  // Best-effort GitHub notify; never fail the write on notify errors.
  try {
    await runGuardedTool({
      toolName: 'external_call',
      requiredCapability: 'tool:external_call',
      payloadText: JSON.stringify({ host: 'api.github.com', method: 'POST', kind: 'issues.create' }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () => maybeNotifyGitHubOnCritical(sanitized),
    });
  } catch {
    // ignore
  }

  return { ok: true };
});
