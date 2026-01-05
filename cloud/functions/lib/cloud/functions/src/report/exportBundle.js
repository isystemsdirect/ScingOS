"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportInspectionBundle = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const reportManifest_1 = require("../../../../scing/report/reportManifest");
const reportExportBundle_1 = require("../../../../scing/report/reportExportBundle");
const evidenceStore_1 = require("../../../../scing/evidence/evidenceStore");
const exportSigner_1 = require("../../../../scing/ui/exportSigner");
const evidenceHash_1 = require("../../../../scing/evidence/evidenceHash");
const safe_1 = require("../shared/types/safe");
const inspectionPolicy_1 = require("../../../../scing/inspection/inspectionPolicy");
const enforce_1 = require("../bane/enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
function isoNow() {
    return new Date().toISOString();
}
async function getPrevWorm(db, scope, scopeId) {
    const headRef = db.doc(`audit/wormHeads/${scope}_${scopeId}`);
    const head = await headRef.get();
    if (!head.exists)
        return { prev: null, headRef };
    const d = head.data();
    return { prev: { thisHash: d.thisHash, index: d.index }, headRef };
}
async function setWormHead(headRef, worm) {
    await headRef.set({ thisHash: worm.thisHash, index: worm.index, prevHash: worm.prevHash, updatedAt: isoNow() }, { merge: true });
}
async function getWormHead(db, scope, scopeId) {
    const head = await db.doc(`audit/wormHeads/${scope}_${scopeId}`).get();
    if (!head.exists)
        return null;
    const d = head.data();
    return { scope, scopeId, thisHash: d.thisHash, index: d.index, prevHash: d.prevHash ?? undefined };
}
exports.exportInspectionBundle = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'exportInspectionBundle', data, ctx });
    const uid = gate.uid;
    const { inspectionId, reportId, correlationId } = data ?? {};
    if (!inspectionId || !reportId)
        throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
    const corr = correlationId ? String(correlationId) : undefined;
    functions.logger.info('exportInspectionBundle:start', { inspectionId, reportId, correlationId: corr });
    const envKey = process.env.SCING_REPORT_SIGNING_KEY_PEM;
    const cfg = functions.config?.();
    const cfgKey = (0, safe_1.isRecord)(cfg) && (0, safe_1.isRecord)(cfg.scing)
        ? (0, safe_1.asString)(cfg.scing.report_signing_key_pem)
        : '';
    const privateKeyPem = envKey || cfgKey;
    if (!privateKeyPem) {
        throw new functions.https.HttpsError('failed-precondition', 'SIGNING_KEY_NOT_CONFIGURED');
    }
    const db = admin.firestore();
    try {
        return await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_export_bundle',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ inspectionId, reportId, op: 'exportInspectionBundle' }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => {
                const inspSnap = await db.doc(`inspections/${inspectionId}`).get();
                if (!inspSnap.exists)
                    throw new functions.https.HttpsError('not-found', 'Inspection missing');
                const inspection = inspSnap.data();
                // Enforce policy: bundle export implies finalized and integrity OK.
                const artsSnap = await db.collection(`inspections/${inspectionId}/artifacts`).get();
                const artifacts = artsSnap.docs.map((d) => d.data());
                const decision = (0, inspectionPolicy_1.evaluateFinalize)({ inspection, artifacts, online: true });
                if (!decision.allow || decision.status !== 'final') {
                    throw new functions.https.HttpsError('failed-precondition', 'EXPORT_BLOCKED', {
                        reasons: decision.reasons,
                    });
                }
                const reportSnap = await db.doc(`inspections/${inspectionId}/reportBlocks/${reportId}`).get();
                if (!reportSnap.exists)
                    throw new functions.https.HttpsError('not-found', 'Report missing');
                const report = reportSnap.data();
                // Collect worm heads for inspection + each artifact
                const wormHeads = [];
                const inspHead = await getWormHead(db, 'inspection', inspectionId);
                if (inspHead)
                    wormHeads.push(inspHead);
                for (const a of artifacts) {
                    const h = await getWormHead(db, 'artifact', a.artifactId);
                    if (h)
                        wormHeads.push(h);
                }
                const blobs = [
                    { name: 'inspection.json', json: inspection },
                    { name: 'report.json', json: report },
                ];
                const createdAt = isoNow();
                const manifest = (0, reportManifest_1.buildManifest)({
                    orgId: inspection.orgId,
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
                const reportHtml = (0, reportExportBundle_1.renderSimpleHtml)(report);
                const unsignedBundle = {
                    bundleVersion: '1',
                    orgId: inspection.orgId,
                    inspectionId,
                    reportId,
                    createdAt,
                    manifest,
                    reportJson: report,
                    reportHtml,
                };
                const bundleDigest = (0, reportExportBundle_1.bundleHash)(unsignedBundle);
                const signature = (0, exportSigner_1.signReport)({ kind: 'exportBundle', bundleDigest, manifestHash: (0, evidenceHash_1.sha256Hex)(JSON.stringify(manifest)) }, privateKeyPem);
                // Append custody event: EXPORTED (inspection scope)
                const { prev, headRef } = await getPrevWorm(db, 'inspection', inspectionId);
                const eventId = db.collection('_').doc().id;
                const ev = (0, evidenceStore_1.makeArtifactEvent)({
                    eventId,
                    orgId: inspection.orgId,
                    inspectionId,
                    artifactId: undefined,
                    type: 'EXPORTED',
                    ts: createdAt,
                    actor: { uid, orgId: inspection.orgId },
                    engineId: 'SCING',
                    details: {
                        reportId,
                        bundleDigest,
                        manifestHash: (0, evidenceHash_1.sha256Hex)(JSON.stringify(manifest)),
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
            },
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
//# sourceMappingURL=exportBundle.js.map