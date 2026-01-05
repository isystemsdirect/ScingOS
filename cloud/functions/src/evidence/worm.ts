import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { makeArtifactEvent } from '../../../../scing/evidence/evidenceStore';
import type { WormChainRef } from '../../../../scing/evidence/evidenceTypes';
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

export const evidenceAppendEvent = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'evidenceAppendEvent', data, ctx });
  const uid = gate.uid;

  const { orgId, inspectionId, artifactId, type, details, wormScope } = data ?? {};
  if (!orgId || !inspectionId || !type || !wormScope) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }

  const db = admin.firestore();
  const ts = isoNow();
  const eventId = db.collection('_').doc().id;
  let scopeId: string | undefined;
  if (wormScope === 'org') scopeId = orgId;
  else if (wormScope === 'inspection') scopeId = inspectionId;
  else scopeId = artifactId;
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

  return { ok: true, eventId, worm: ev.worm };
});
