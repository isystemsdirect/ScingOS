import * as admin from 'firebase-admin';
import { assertOrgAdmin, isoNow } from './middleware';
import type { BaneKey } from '../../../../scing/bane/baneTypes';

export type RevokeRequest = { orgId: string; targetUid: string; key: BaneKey; reason?: string };

export async function revokeEntitlement(actorUid: string, req: RevokeRequest) {
  const db = admin.firestore();
  await assertOrgAdmin(req.orgId, actorUid);

  const entId = `${req.targetUid}_${req.key}`;
  const entRef = db.doc(`orgs/${req.orgId}/entitlements/${entId}`);
  const prev = await entRef.get();
  if (!prev.exists) return { ok: true, entitlementId: entId, alreadyMissing: true };

  const prevData = prev.data()!;
  const nextPolicyVersion = (Number(prevData.policyVersion ?? 0) || 0) + 1;

  const ts = isoNow();
  await entRef.set(
    {
      status: 'revoked',
      updatedAt: ts,
      policyVersion: nextPolicyVersion,
      revokeReason: req.reason ?? 'admin_revoke',
    },
    { merge: true }
  );

  await db.collection('audit').doc('baneEvents').collection('events').add({
    ts,
    orgId: req.orgId,
    actorUid,
    targetUid: req.targetUid,
    action: 'ENTITLEMENT_REVOKE',
    before: {
      status: prevData.status,
      stage: prevData.stage,
      expiresAt: prevData.expiresAt,
      policyVersion: prevData.policyVersion,
    },
    after: {
      status: 'revoked',
      policyVersion: nextPolicyVersion,
      reason: req.reason ?? 'admin_revoke',
    },
  });

  return { ok: true, entitlementId: entId, policyVersion: nextPolicyVersion };
}
