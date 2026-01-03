import * as functions from 'firebase-functions';
import { issueEntitlement } from './issue';
import { revokeEntitlement } from './revoke';
import { issuePolicySnapshot } from './snapshot';

export const baneIssueEntitlement = functions.https.onCall(async (data, ctx) => {
  const actorUid = ctx.auth?.uid;
  if (!actorUid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');
  return issueEntitlement(actorUid, data);
});

export const baneRevokeEntitlement = functions.https.onCall(async (data, ctx) => {
  const actorUid = ctx.auth?.uid;
  if (!actorUid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');
  return revokeEntitlement(actorUid, data);
});

export const baneIssuePolicySnapshot = functions.https.onCall(async (data, ctx) => {
  const uid = ctx.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');
  const orgId = data?.orgId;
  if (!orgId) throw new functions.https.HttpsError('invalid-argument', 'orgId required');
  return issuePolicySnapshot(orgId, uid);
});
