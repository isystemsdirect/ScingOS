import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { verifyEd25519Base64Url } from '../../../../scing/evidence/evidenceSign';
import { makeArtifactEvent } from '../../../../scing/evidence/evidenceStore';

function isoNow() {
  return new Date().toISOString();
}

async function getPrevWorm(db: FirebaseFirestore.Firestore, scope: string, scopeId: string) {
  const headRef = db.doc(`audit/wormHeads/${scope}_${scopeId}`);
  const head = await headRef.get();
  if (!head.exists) return { prev: null as any, headRef };
  const d = head.data()!;
  return { prev: { thisHash: d.thisHash as string, index: d.index as number }, headRef };
}

async function setWormHead(headRef: FirebaseFirestore.DocumentReference, worm: any) {
  await headRef.set(
    { thisHash: worm.thisHash, index: worm.index, prevHash: worm.prevHash, updatedAt: isoNow() },
    { merge: true }
  );
}

export const evidenceFinalizeArtifact = functions.https.onCall(async (data, ctx) => {
  const uid = ctx.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');

  const { orgId, inspectionId, artifactId, contentHash, signature, signer } = data ?? {};
  if (!orgId || !inspectionId || !artifactId || !contentHash) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }

  const db = admin.firestore();
  const artRef = db.doc(`inspections/${inspectionId}/artifacts/${artifactId}`);
  const artSnap = await artRef.get();
  if (!artSnap.exists) throw new functions.https.HttpsError('not-found', 'Artifact missing');

  const art = artSnap.data() as any;
  if (art.orgId !== orgId) throw new functions.https.HttpsError('permission-denied', 'ORG_MISMATCH');

  if (art.integrity?.contentHash && art.integrity.contentHash !== contentHash) {
    throw new functions.https.HttpsError('failed-precondition', 'HASH_MISMATCH');
  }

  let integrityState: 'verified' | 'failed' | 'pending' = 'pending';
  let failureReason: string | undefined;

  if (signature && signer === 'server') {
    integrityState = 'verified';
  }

  if (signature?.alg === 'EdDSA' && signer === 'device') {
    const deviceId = art.provenance?.capturedOn?.deviceId;
    if (!deviceId) throw new functions.https.HttpsError('failed-precondition', 'NO_DEVICE');

    const devSnap = await db.doc(`orgs/${orgId}/devices/${deviceId}`).get();
    const pub = devSnap.data()?.publicKeyPem;
    if (!pub) throw new functions.https.HttpsError('failed-precondition', 'NO_DEVICE_PUBKEY');

    const payload = JSON.stringify({ orgId, inspectionId, artifactId, contentHash });
    const ok = verifyEd25519Base64Url(pub, payload, signature.sig);
    integrityState = ok ? 'verified' : 'failed';
    if (!ok) failureReason = 'BAD_SIGNATURE';
  }

  const ts = isoNow();
  await artRef.set(
    {
      integrity: {
        contentHash,
        hashAlg: 'sha256',
        signature: signature
          ? { ...signature, signedAt: ts, signer }
          : admin.firestore.FieldValue.delete(),
        integrityState,
        verifiedAt: integrityState === 'verified' ? ts : admin.firestore.FieldValue.delete(),
        failureReason: failureReason ?? admin.firestore.FieldValue.delete(),
      },
      finalized: true,
      updatedAt: ts,
    },
    { merge: true }
  );

  const { prev, headRef } = await getPrevWorm(db, 'artifact', artifactId);
  const eventId = db.collection('_').doc().id;
  const ev = makeArtifactEvent({
    eventId,
    orgId,
    inspectionId,
    artifactId,
    type: 'VERIFIED',
    ts,
    actor: { uid, orgId },
    device: art.provenance?.capturedOn ?? undefined,
    engineId: art.provenance?.engineId ?? undefined,
    details: { integrityState, failureReason: failureReason ?? null },
    prevWorm: prev,
    wormScope: 'artifact',
    wormScopeId: artifactId,
  });

  await db.doc(`inspections/${inspectionId}/artifactEvents/${eventId}`).set(ev, { merge: false });
  await db.collection('audit').doc('evidenceEvents').collection('events').doc(eventId).set(ev, { merge: false });
  await setWormHead(headRef, ev.worm);

  return { ok: true, integrityState };
});
