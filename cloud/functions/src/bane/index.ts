import * as functions from 'firebase-functions';
import { requestCapability } from './capability';
import { createSDR } from './sdr';
import { checkPolicy } from './policy';
import { baneIssueEntitlement, baneIssuePolicySnapshot, baneRevokeEntitlement } from './admin';
import { enforceBaneCallable } from './enforce';
import { runGuardedTool } from '../../../../scing/bane/server/toolBoundary';

/**
 * BANE (Backend Augmented Neural Engine)
 * Security governance and capability-based authorization
 */

// Request capability token
export const requestCapabilityFunc = functions.https.onCall(async (data, context) => {
  const gate = await enforceBaneCallable({ name: 'requestCapabilityFunc', data, ctx: context });

  const { action, metadata } = data;
  const userId = gate.uid;

  try {
    const token = await runGuardedTool({
      toolName: 'bane_requestCapability',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ action: action ? String(action) : null }),
      identityId: userId,
      capabilities: gate.capabilities,
      exec: async () => requestCapability(userId, action, metadata),
    });
    return { token };
  } catch (error: unknown) {
    if ((error as any)?.baneTraceId) {
      throw new functions.https.HttpsError('permission-denied', (error as any).message, {
        traceId: (error as any).baneTraceId,
      });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new functions.https.HttpsError('permission-denied', message);
  }
});

// Create Security Decision Record
export const createSDRFunc = functions.https.onCall(async (data, context) => {
  const gate = await enforceBaneCallable({ name: 'createSDRFunc', data, ctx: context });
  try {
    const sdrId = await runGuardedTool({
      toolName: 'bane_createSDR',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ action: data?.action ? String(data.action) : null }),
      identityId: gate.uid,
      capabilities: gate.capabilities,
      exec: async () =>
        createSDR({
          userId: gate.uid,
          action: data.action,
          result: data.result,
          metadata: data.metadata,
        }),
    });
    return { sdrId };
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});

// Check if action is allowed by policy
export const checkPolicyFunc = functions.https.onCall(async (data, context) => {
  const gate = await enforceBaneCallable({ name: 'checkPolicyFunc', data, ctx: context });

  const { action, resource } = data;
  const userId = gate.uid;

  try {
    const allowed = await runGuardedTool({
      toolName: 'bane_checkPolicy',
      requiredCapability: 'tool:db_read',
      payloadText: JSON.stringify({ action: action ? String(action) : null }),
      identityId: userId,
      capabilities: gate.capabilities,
      exec: async () => checkPolicy(userId, action, resource),
    });
    return { allowed };
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});

export const baneRouter = {
  requestCapability: requestCapabilityFunc,
  createSDR: createSDRFunc,
  checkPolicy: checkPolicyFunc,
  issueEntitlement: baneIssueEntitlement,
  revokeEntitlement: baneRevokeEntitlement,
  issuePolicySnapshot: baneIssuePolicySnapshot,
};

export { baneIssueEntitlement, baneRevokeEntitlement, baneIssuePolicySnapshot };