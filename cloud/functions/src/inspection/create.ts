import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

function isoNow() {
  return new Date().toISOString();
}

export const createInspection = functions.https.onCall(async (data, ctx) => {
  const uid = ctx.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');

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

  await db.doc(`inspections/${inspectionId}`).set(record, { merge: false });
  return { ok: true, inspectionId, record };
});
