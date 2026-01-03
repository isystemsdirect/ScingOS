import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
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

export const evidenceAppendEvent = functions.https.onCall(async (data, ctx) => {
  const uid = ctx.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');

  const { orgId, inspectionId, artifactId, type, details, wormScope } = data ?? {};
  if (!orgId || !inspectionId || !type || !wormScope) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }

  const db = admin.firestore();
  const ts = isoNow();
  const eventId = db.collection('_').doc().id;
  const scopeId = wormScope === 'org' ? orgId : wormScope === 'inspection' ? inspectionId : artifactId;
  if (!scopeId) throw new functions.https.HttpsError('invalid-argument', 'wormScopeId missing');

  const { prev, headRef } = await getPrevWorm(db, wormScope, scopeId);
  const ev = makeArtifactEvent({
    eventId,
    orgId,
    inspectionId,
    artifactId: artifactId ?? undefined,
    type,
    ts,
    actor: { uid, orgId },
    engineId: data?.engineId ?? undefined,
    details: details ?? null,
    prevWorm: prev,
    wormScope,
    wormScopeId: scopeId,
  });

  await db.doc(`inspections/${inspectionId}/artifactEvents/${eventId}`).set(ev, { merge: false });
  await db.collection('audit').doc('evidenceEvents').collection('events').doc(eventId).set(ev, { merge: false });
  await setWormHead(headRef, ev.worm);

  return { ok: true, eventId, worm: ev.worm };
});
