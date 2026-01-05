import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { enforceBaneCallable } from '../bane/enforce';
import { runGuardedTool } from '../../../../scing/bane/server/toolBoundary';

function isoNow() {
  return new Date().toISOString();
}

export const createInspection = functions.https.onCall(async (data, ctx) => {
  const gate = await enforceBaneCallable({ name: 'createInspection', data, ctx });
  const uid = gate.uid;

  const { orgId, title, description, location, addressText, domainKey, domainVersion } = data ?? {};
  if (!orgId || !title) throw new functions.https.HttpsError('invalid-argument', 'Missing fields');

  const db = admin.firestore();
  const inspectionId = db.collection('_').doc().id;
  const ts = isoNow();

  const record = {
    inspectionId,
    orgId,
    domainKey: domainKey ?? 'moisture_mold',
    domainVersion: domainVersion ?? '1.0.0',
    title,
    description: description ?? null,
    createdAt: ts,
    updatedAt: ts,
    createdByUid: uid,
    assignedToUid: uid,
    status: 'open',
    location: location ?? null,
    addressText: addressText ?? null,
    requiredArtifactTypes: ['photo'],
    requiredMinimumArtifacts: 1,
  };

  try {
    await runGuardedTool({
      toolName: 'firestore_write',
      requiredCapability: 'tool:db_write',
      payloadText: JSON.stringify({ collection: 'inspections', op: 'set', docId: inspectionId }),
      identityId: uid,
      capabilities: gate.capabilities,
      exec: async () => db.doc(`inspections/${inspectionId}`).set(record, { merge: false }),
    });
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
  return { ok: true, inspectionId, record };
});
