import * as admin from 'firebase-admin';
import { assertOrgAdmin, isoNow } from './middleware';
import type { BaneKey, Stage } from '../../../../scing/bane/baneTypes';
import { KEY_CAPS, KEY_STAGE_DEFAULT } from '../../../../scing/bane/baneKeys';

export type IssueRequest = {
  orgId: string;
  targetUid: string;
  key: BaneKey;
  stage?: Stage;
  days?: number; // default 30
  seatBound?: boolean;
  deviceBound?: boolean;
  allowedDeviceIds?: string[];
  caps?: string[];
};

export async function issueEntitlement(actorUid: string, req: IssueRequest) {
  const db = admin.firestore();
  await assertOrgAdmin(req.orgId, actorUid);

  const stage = req.stage ?? KEY_STAGE_DEFAULT[req.key];
  const days = req.days ?? 30;

  const issuedAt = isoNow();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const entId = `${req.targetUid}_${req.key}`;
  const entRef = db.doc(`orgs/${req.orgId}/entitlements/${entId}`);

  const prev = await entRef.get();
  const prevData = prev.exists ? prev.data() : null;

  let before: {
    status?: unknown;
    stage?: unknown;
    expiresAt?: unknown;
    policyVersion?: unknown;
  } | null = null;
  if (prevData) {
    before = {
      status: prevData.status,
      stage: prevData.stage,
      expiresAt: prevData.expiresAt,
      policyVersion: prevData.policyVersion,
    };
  }

  const nextPolicyVersion = (Number(prevData?.policyVersion ?? 0) || 0) + 1;
  const caps = req.caps ?? KEY_CAPS[req.key];

  const next = {
    uid: req.targetUid,
    orgId: req.orgId,
    key: req.key,
    stage,
    status: 'active',
    issuedAt,
    expiresAt,
    graceUntil: null,
    seatBound: Boolean(req.seatBound),
    deviceBound: Boolean(req.deviceBound),
    allowedDeviceIds: req.allowedDeviceIds ?? [],
    caps,
    policyVersion: nextPolicyVersion,
    updatedAt: issuedAt,
  };

  await entRef.set(next, { merge: true });

  await db.collection('audit').doc('baneEvents').collection('events').add({
    ts: issuedAt,
    orgId: req.orgId,
    actorUid,
    targetUid: req.targetUid,
    action: prev.exists ? 'ENTITLEMENT_RENEW' : 'ENTITLEMENT_ISSUE',
    before,
    after: {
      status: next.status,
      stage: next.stage,
      expiresAt: next.expiresAt,
      policyVersion: next.policyVersion,
    },
  });

  return { ok: true, entitlementId: entId, policyVersion: nextPolicyVersion };
}
