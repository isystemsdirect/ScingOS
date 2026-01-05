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
exports.buildInspectionReport = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const reportComposer_1 = require("../../../../scing/report/reportComposer");
const enforce_1 = require("../bane/enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
exports.buildInspectionReport = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'buildInspectionReport', data, ctx });
    const uid = gate.uid;
    const { inspectionId } = data ?? {};
    if (!inspectionId)
        throw new functions.https.HttpsError('invalid-argument', 'Missing inspectionId');
    const db = admin.firestore();
    try {
        return await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_report_build',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ inspectionId, op: 'buildInspectionReport' }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => {
                const inspSnap = await db.doc(`inspections/${inspectionId}`).get();
                if (!inspSnap.exists)
                    throw new functions.https.HttpsError('not-found', 'Inspection missing');
                const inspection = inspSnap.data();
                const [artsSnap, findsSnap, clsSnap, mapSnap] = await Promise.all([
                    db.collection(`inspections/${inspectionId}/artifacts`).get(),
                    db.collection(`inspections/${inspectionId}/findings`).get(),
                    db.collection(`inspections/${inspectionId}/classifications`).get(),
                    db.collection(`inspections/${inspectionId}/mapLayers`).get(),
                ]);
                const artifacts = artsSnap.docs.map((d) => d.data());
                const findings = findsSnap.docs.map((d) => d.data());
                const classifications = clsSnap.docs.map((d) => d.data());
                const mapLayers = mapSnap.docs.map((d) => d.data());
                let report;
                try {
                    report = (0, reportComposer_1.composeDeterministicReport)({
                        inspection,
                        artifacts,
                        findings,
                        classifications,
                        mapLayers,
                    });
                }
                catch (err) {
                    if (err instanceof reportComposer_1.EvidenceLinkError) {
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
            },
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
//# sourceMappingURL=build.js.map