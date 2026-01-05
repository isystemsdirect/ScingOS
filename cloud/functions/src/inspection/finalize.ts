import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { evaluateFinalize } from '../../../../scing/inspection/inspectionPolicy';
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

export const finalizeInspection = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'finalizeInspection', data, ctx });
  const uid = gate.uid;

  const { inspectionId, correlationId } = data ?? {};
  if (!inspectionId) throw new functions.https.HttpsError('invalid-argument', 'Missing inspectionId');

  const corr = correlationId ? String(correlationId) : undefined;
  functions.logger.info('finalizeInspection:start', { inspectionId, correlationId: corr });

  const db = admin.firestore();
  const inspRef = db.doc(`inspections/${inspectionId}`);
  const inspSnap = await inspRef.get();
  if (!inspSnap.exists) throw new functions.https.HttpsError('not-found', 'Inspection missing');

  const insp = inspSnap.data() as unknown as {
    orgId: string;
    status: 'open' | 'in_progress' | 'ready_to_finalize' | 'final' | 'archived';
    requiredMinimumArtifacts: number;
    requiredArtifactTypes: ArtifactRecord['type'][];
  };

  const artsSnap = await db.collection(`inspections/${inspectionId}/artifacts`).get();
  const artifacts = artsSnap.docs.map((d) => d.data() as ArtifactRecord);

  const decision = evaluateFinalize({ inspection: insp as any, artifacts, online: true });
  if (!decision.allow || decision.status !== 'final') {
    throw new functions.https.HttpsError('failed-precondition', 'FINALIZE_BLOCKED', {
      reasons: decision.reasons,
    });
  }

  const ts = isoNow();
  try {
    await runGuardedTool({
      toolName: 'firestore_write',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ collection: 'inspections', op: 'merge', docId: inspectionId, status: 'final' }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () =>
        inspRef.set({ status: 'final', finalizedAt: ts, finalizedByUid: uid, updatedAt: ts }, { merge: true }),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }

  // Append custody event (inspection scope)
  const { prev, headRef } = await getPrevWorm(db, 'inspection', inspectionId);
  const eventId = db.collection('_').doc().id;
  const ev = makeArtifactEvent({
    eventId,
    orgId: insp.orgId,
    inspectionId,
    artifactId: undefined,
    type: 'TRANSFERRED',
    ts,
    actor: { uid, orgId: insp.orgId },
    engineId: 'SCING',
    details: { kind: 'FINALIZED', correlationId: corr ?? null },
    prevWorm: prev,
    wormScope: 'inspection',
    wormScopeId: inspectionId,
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

  functions.logger.info('finalizeInspection:ok', { inspectionId, correlationId: corr });

  return { ok: true, status: 'final' };
});

