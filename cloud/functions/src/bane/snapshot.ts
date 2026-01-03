import * as admin from 'firebase-admin';
import { isoNow, mustEnv } from './middleware';
import type { BaneKey, PolicyConstraints, PolicySnapshot } from '../../../../scing/bane/baneTypes';
import { computeSnapshotHash } from '../../../../scing/bane/banePolicySnapshot';
import { signSnapshotHmac } from '../../../../scing/bane/baneSignature';

export async function issuePolicySnapshot(orgId: string, uid: string): Promise<PolicySnapshot> {
  const db = admin.firestore();

  // roles
  const mem = await db.doc(`orgs/${orgId}/members/${uid}`).get();
  if (!mem.exists) throw new Error('NO_ROLE');
  const role = mem.data()!.role as any;

  // entitlements
  const entsSnap = await db.collection(`orgs/${orgId}/entitlements`).where('uid', '==', uid).get();
  const entitlements: any = {};
  let maxPolicyVersion = 0;

  entsSnap.forEach((d) => {
    const e = d.data();
    const key = e.key as BaneKey;
    entitlements[key] = {
      uid: e.uid,
      key: e.key,
      stage: e.stage,
      status: e.status,
      issuedAt: e.issuedAt,
      expiresAt: e.expiresAt,
      graceUntil: e.graceUntil ?? undefined,
      seatBound: Boolean(e.seatBound),
      deviceBound: Boolean(e.deviceBound),
      allowedDeviceIds: e.allowedDeviceIds ?? [],
      caps: e.caps ?? [],
      policyVersion: e.policyVersion ?? 0,
      updatedAt: e.updatedAt,
    };
    maxPolicyVersion = Math.max(maxPolicyVersion, Number(e.policyVersion ?? 0) || 0);
  });

  // constraints (tight defaults; relax only by plan tier later)
  const constraints: PolicyConstraints = {
    offlineAllowed: true,
    offlineHardDenyExternalHardware: true,
    offlineHardDenyPhysicalControl: true,
    maxOfflineSeconds: 6 * 60 * 60, // 6 hours
  };

  const issuedAt = isoNow();
  const expiresAt = new Date(Date.now() + constraints.maxOfflineSeconds * 1000).toISOString();

  const unsigned = {
    uid,
    orgId,
    issuedAt,
    expiresAt,
    policyVersion: maxPolicyVersion,
    roles: { [uid]: role },
    entitlements,
    constraints,
  } as Omit<PolicySnapshot, 'hash' | 'signature'>;

  const hash = computeSnapshotHash(unsigned as any);
  const kid = mustEnv('BANE_SNAPSHOT_KID');
  const secret = mustEnv('BANE_SNAPSHOT_HMAC_SECRET');

  const payload = JSON.stringify({ ...unsigned, hash });
  const signature = signSnapshotHmac({ kid, secret, payload });

  const snapshot: PolicySnapshot = { ...unsigned, hash, signature };

  await db.doc(`orgs/${orgId}/policySnapshots/${uid}`).set(snapshot, { merge: true });
  await db.collection('audit').doc('baneEvents').collection('events').add({
    ts: issuedAt,
    orgId,
    actorUid: uid,
    targetUid: uid,
    action: 'SNAPSHOT_ISSUE',
    after: { policyVersion: maxPolicyVersion, expiresAt },
  });

  return snapshot;
}
