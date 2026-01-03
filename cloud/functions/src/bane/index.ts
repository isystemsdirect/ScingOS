import * as functions from 'firebase-functions';
import { requestCapability } from './capability';
import { createSDR } from './sdr';
import { checkPolicy } from './policy';
import { baneIssueEntitlement, baneIssuePolicySnapshot, baneRevokeEntitlement } from './admin';

/**
 * BANE (Backend Augmented Neural Engine)
 * Security governance and capability-based authorization
 */

// Request capability token
export const requestCapabilityFunc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to request capabilities'
    );
  }

  const { action, metadata } = data;
  const userId = context.auth.uid;

  try {
    const token = await requestCapability(userId, action, metadata);
    return { token };
  } catch (error: any) {
    throw new functions.https.HttpsError('permission-denied', error.message);
  }
});

// Create Security Decision Record
export const createSDRFunc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const sdrId = await createSDR({
    userId: context.auth.uid,
    action: data.action,
    result: data.result,
    metadata: data.metadata,
  });

  return { sdrId };
});

// Check if action is allowed by policy
export const checkPolicyFunc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { action, resource } = data;
  const userId = context.auth.uid;

  const allowed = await checkPolicy(userId, action, resource);
  return { allowed };
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