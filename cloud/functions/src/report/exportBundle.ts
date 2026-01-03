import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { buildManifest } from '../../../../scing/report/reportManifest';
import { renderSimpleHtml, bundleHash } from '../../../../scing/report/reportExportBundle';
import type { ArtifactRecord } from '../../../../scing/evidence/evidenceTypes';
import { makeArtifactEvent } from '../../../../scing/evidence/evidenceStore';
import type { WormChainRef } from '../../../../scing/evidence/evidenceTypes';
import { signReport } from '../../../../scing/ui/exportSigner';
import { sha256Hex } from '../../../../scing/evidence/evidenceHash';
import { asString, isRecord } from '../shared/types/safe';
import { evaluateFinalize } from '../../../../scing/inspection/inspectionPolicy';

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

async function getWormHead(db: FirebaseFirestore.Firestore, scope: string, scopeId: string) {
  const head = await db.doc(`audit/wormHeads/${scope}_${scopeId}`).get();
  if (!head.exists) return null;
  const d = head.data() as { thisHash: string; index: number; prevHash?: string };
  return { scope, scopeId, thisHash: d.thisHash, index: d.index, prevHash: d.prevHash ?? undefined };
}

export const exportInspectionBundle = functions.https.onCall(async (data, ctx) => {
  const uid = ctx.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');

  const { inspectionId, reportId, correlationId } = data ?? {};
  if (!inspectionId || !reportId)
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');

  const corr = correlationId ? String(correlationId) : undefined;
  functions.logger.info('exportInspectionBundle:start', { inspectionId, reportId, correlationId: corr });

  const envKey = process.env.SCING_REPORT_SIGNING_KEY_PEM;
  const cfg = functions.config?.() as unknown;
  const cfgKey =
    isRecord(cfg) && isRecord(cfg.scing)
      ? asString(cfg.scing.report_signing_key_pem)
      : '';
  const privateKeyPem = envKey || cfgKey;
  if (!privateKeyPem) {
    throw new functions.https.HttpsError('failed-precondition', 'SIGNING_KEY_NOT_CONFIGURED');
  }

  const db = admin.firestore();
  const inspSnap = await db.doc(`inspections/${inspectionId}`).get();
  if (!inspSnap.exists) throw new functions.https.HttpsError('not-found', 'Inspection missing');
  const inspection = inspSnap.data() as any;

  // Enforce policy: bundle export implies finalized and integrity OK.
  const artsSnap = await db.collection(`inspections/${inspectionId}/artifacts`).get();
  const artifacts = artsSnap.docs.map((d) => d.data() as ArtifactRecord);
  const decision = evaluateFinalize({ inspection, artifacts, online: true });
  if (!decision.allow || decision.status !== 'final') {
    throw new functions.https.HttpsError('failed-precondition', 'EXPORT_BLOCKED', {
      reasons: decision.reasons,
    });
  }

  const reportSnap = await db.doc(`inspections/${inspectionId}/reportBlocks/${reportId}`).get();
  if (!reportSnap.exists) throw new functions.https.HttpsError('not-found', 'Report missing');
  const report = reportSnap.data() as unknown;

  // Collect worm heads for inspection + each artifact
  const wormHeads: Array<{
    scope: string;
    scopeId: string;
    thisHash: string;
    index: number;
    prevHash?: string;
  }> = [];
  const inspHead = await getWormHead(db, 'inspection', inspectionId);
  if (inspHead) wormHeads.push(inspHead);
  for (const a of artifacts) {
    const h = await getWormHead(db, 'artifact', a.artifactId);
    if (h) wormHeads.push(h);
  }

  const blobs = [
    { name: 'inspection.json', json: inspection },
    { name: 'report.json', json: report },
  ];

  const createdAt = isoNow();
  const manifest = buildManifest({
    orgId: inspection.orgId as string,
    inspectionId,
    reportId,
    createdAt,
    blobs,
    artifacts: artifacts.map((a) => ({
      artifactId: a.artifactId,
      contentHash: a.integrity.contentHash,
      integrityState: a.integrity.integrityState,
      finalized: a.finalized,
    })),
    wormHeads,
  });

  const reportHtml = renderSimpleHtml(report);

  const unsignedBundle = {
    bundleVersion: '1' as const,
    orgId: inspection.orgId as string,
    inspectionId,
    reportId,
    createdAt,
    manifest,
    reportJson: report,
    reportHtml,
  };

  const bundleDigest = bundleHash(unsignedBundle);
  const signature = signReport(
    { kind: 'exportBundle', bundleDigest, manifestHash: sha256Hex(JSON.stringify(manifest)) },
    privateKeyPem
  );

  // Append custody event: EXPORTED (inspection scope)
  const { prev, headRef } = await getPrevWorm(db, 'inspection', inspectionId);
  const eventId = db.collection('_').doc().id;
  const ev = makeArtifactEvent({
    eventId,
    orgId: inspection.orgId as string,
    inspectionId,
    artifactId: undefined,
    type: 'EXPORTED',
    ts: createdAt,
    actor: { uid, orgId: inspection.orgId as string },
    engineId: 'SCING',
    details: {
      reportId,
      bundleDigest,
      manifestHash: sha256Hex(JSON.stringify(manifest)),
      correlationId: corr ?? null,
    },
    prevWorm: prev,
    wormScope: 'inspection',
    wormScopeId: inspectionId,
  });

  await db.doc(`inspections/${inspectionId}/artifactEvents/${eventId}`).set(ev, { merge: false });
  const auditRef = db.collection('audit').doc('evidenceEvents').collection('events').doc(eventId);
  await auditRef.set(ev, { merge: false });
  await setWormHead(headRef, ev.worm);

  functions.logger.info('exportInspectionBundle:ok', {
    inspectionId,
    reportId,
    correlationId: corr,
    bundleDigest,
  });

  return {
    ok: true,
    bundle: {
      ...unsignedBundle,
      signature: {
        alg: signature.alg,
        kid: signature.kid,
        sig: signature.sig,
        signedAt: isoNow(),
      },
    },
  };
});

