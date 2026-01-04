import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { verifyEd25519Base64Url } from '../../../../scing/evidence/evidenceSign';
import { makeArtifactEvent } from '../../../../scing/evidence/evidenceStore';
import type { ArtifactRecord, WormChainRef } from '../../../../scing/evidence/evidenceTypes';
import { enforceBaneCallable } from '../bane/enforce';
import { runGuardedTool } from '../../../../scing/bane/server/toolBoundary';

function isoNow() {
  return new Date().toISOString();
}

type PrevWorm = { thisHash: string; index: number } | null;

async function getPrevWorm(db: FirebaseFirestore.Firestore, scope: string, scopeId: string) {
  const headRef = db.doc(`audit/wormHeads/${scope}_${scopeId}`);
  const head = await headRef.get();
  if (!head.exists) return { prev: null as PrevWorm, headRef };
  const d = head.data()!;
  return { prev: { thisHash: d.thisHash as string, index: d.index as number }, headRef };
}

async function setWormHead(headRef: FirebaseFirestore.DocumentReference, worm: WormChainRef) {
  await headRef.set(
    { thisHash: worm.thisHash, index: worm.index, prevHash: worm.prevHash, updatedAt: isoNow() },
    { merge: true }
  );
}

export const evidenceFinalizeArtifact = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'evidenceFinalizeArtifact', data, ctx });
  const uid = gate.uid;

  const { orgId, inspectionId, artifactId, contentHash, signature, signer } = data ?? {};
  if (!orgId || !inspectionId || !artifactId || !contentHash) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }

  const db = admin.firestore();
  const artRefPath = `inspections/${inspectionId}/artifacts/${artifactId}`;
  const artRef = db.doc(artRefPath);
  const artSnap = await artRef.get();
  if (!artSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Artifact missing');
  }

  const art = artSnap.data() as ArtifactRecord;
  if (art.orgId !== orgId) {
    throw new functions.https.HttpsError('permission-denied', 'ORG_MISMATCH');
  }

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
  try {
    await runGuardedTool({
      toolName: 'firestore_write',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'merge', path: artRefPath, finalized: true }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () =>
        artRef.set(
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
        ),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }

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

  try {
    await runGuardedTool({
      toolName: 'firestore_write',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'set', path: `inspections/${inspectionId}/artifactEvents/${eventId}` }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () => db.doc(`inspections/${inspectionId}/artifactEvents/${eventId}`).set(ev, { merge: false }),
    });

    const auditRef = db.collection('audit').doc('evidenceEvents').collection('events').doc(eventId);
    await runGuardedTool({
      toolName: 'firestore_write',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'set', path: `audit/evidenceEvents/events/${eventId}` }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () => auditRef.set(ev, { merge: false }),
    });

    await runGuardedTool({
      toolName: 'firestore_write',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ op: 'merge', path: (headRef as any).path ?? 'audit/wormHeads/*' }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () => setWormHead(headRef, ev.worm),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }

  return { ok: true, integrityState };
});
