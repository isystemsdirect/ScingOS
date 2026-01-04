import * as functions from 'firebase-functions';
import { issueEntitlement } from './issue';
import { revokeEntitlement } from './revoke';
import { issuePolicySnapshot } from './snapshot';
import { enforceBaneCallable } from './enforce';
import { runGuardedTool } from '../../../../scing/bane/server/toolBoundary';

export const baneIssueEntitlement = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'baneIssueEntitlement', data, ctx });
  try {
    return await runGuardedTool({
      toolName: 'bane_issueEntitlement',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'issueEntitlement' }),
      identityId: gate.uid,
      capabilities: gate.capabilities,
      exec: async () => issueEntitlement(gate.uid, data),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});

export const baneRevokeEntitlement = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'baneRevokeEntitlement', data, ctx });
  try {
    return await runGuardedTool({
      toolName: 'bane_revokeEntitlement',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'revokeEntitlement' }),
      identityId: gate.uid,
      capabilities: gate.capabilities,
      exec: async () => revokeEntitlement(gate.uid, data),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});

export const baneIssuePolicySnapshot = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'baneIssuePolicySnapshot', data, ctx });
  const orgId = data?.orgId;
  if (!orgId) throw new functions.https.HttpsError('invalid-argument', 'orgId required');
  try {
    return await runGuardedTool({
      toolName: 'bane_issuePolicySnapshot',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'issuePolicySnapshot', orgId: String(orgId) }),
      identityId: gate.uid,
      capabilities: gate.capabilities,
      exec: async () => issuePolicySnapshot(orgId, gate.uid),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});
