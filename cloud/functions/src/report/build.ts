import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { composeDeterministicReport, EvidenceLinkError } from '../../../../scing/report/reportComposer';
import type {
  ArtifactRecord,
  FindingRecord,
  ClassificationRecord,
  MapLayerRecord,
} from '../../../../scing/evidence/evidenceTypes';
import type { InspectionRecord } from '../../../../scing/inspection/inspectionTypes';

export const buildInspectionReport = functions.https.onCall(async (data, ctx) => {
  const uid = ctx.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');

  const { inspectionId } = data ?? {};
  if (!inspectionId) throw new functions.https.HttpsError('invalid-argument', 'Missing inspectionId');

  const db = admin.firestore();
  const inspSnap = await db.doc(`inspections/${inspectionId}`).get();
  if (!inspSnap.exists) throw new functions.https.HttpsError('not-found', 'Inspection missing');
  const inspection = inspSnap.data() as InspectionRecord;

  const [artsSnap, findsSnap, clsSnap, mapSnap] = await Promise.all([
    db.collection(`inspections/${inspectionId}/artifacts`).get(),
    db.collection(`inspections/${inspectionId}/findings`).get(),
    db.collection(`inspections/${inspectionId}/classifications`).get(),
    db.collection(`inspections/${inspectionId}/mapLayers`).get(),
  ]);

  const artifacts = artsSnap.docs.map((d) => d.data() as ArtifactRecord);
  const findings = findsSnap.docs.map((d) => d.data() as FindingRecord);
  const classifications = clsSnap.docs.map((d) => d.data() as ClassificationRecord);
  const mapLayers = mapSnap.docs.map((d) => d.data() as MapLayerRecord);

  let report;
  try {
    report = composeDeterministicReport({
      inspection,
      artifacts,
      findings,
      classifications,
      mapLayers,
    });
  } catch (err) {
    if (err instanceof EvidenceLinkError) {
      throw new functions.https.HttpsError('failed-precondition', 'EVIDENCE_LINK_MISSING', {
        missing: err.missing,
      });
    }
    throw err;
  }

  const reportId = report.reportId;
  await db.doc(`inspections/${inspectionId}/reportBlocks/${reportId}`).set(report, { merge: false });
  await db
    .doc(`inspections/${inspectionId}`)
    .set({ currentReportId: reportId, updatedAt: new Date().toISOString() }, { merge: true });

  return { ok: true, reportId, report };
});
