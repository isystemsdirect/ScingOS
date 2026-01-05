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
exports.finalizeInspection = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const inspectionPolicy_1 = require("../../../../scing/inspection/inspectionPolicy");
const evidenceStore_1 = require("../../../../scing/evidence/evidenceStore");
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
exports.finalizeInspection = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'finalizeInspection', data, ctx });
    const uid = gate.uid;
    const { inspectionId, correlationId } = data ?? {};
    if (!inspectionId)
        throw new functions.https.HttpsError('invalid-argument', 'Missing inspectionId');
    const corr = correlationId ? String(correlationId) : undefined;
    functions.logger.info('finalizeInspection:start', { inspectionId, correlationId: corr });
    const db = admin.firestore();
    const inspRef = db.doc(`inspections/${inspectionId}`);
    const inspSnap = await inspRef.get();
    if (!inspSnap.exists)
        throw new functions.https.HttpsError('not-found', 'Inspection missing');
    const insp = inspSnap.data();
    const artsSnap = await db.collection(`inspections/${inspectionId}/artifacts`).get();
    const artifacts = artsSnap.docs.map((d) => d.data());
    const decision = (0, inspectionPolicy_1.evaluateFinalize)({ inspection: insp, artifacts, online: true });
    if (!decision.allow || decision.status !== 'final') {
        throw new functions.https.HttpsError('failed-precondition', 'FINALIZE_BLOCKED', {
            reasons: decision.reasons,
        });
    }
    const ts = isoNow();
    try {
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_write',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ collection: 'inspections', op: 'merge', docId: inspectionId, status: 'final' }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => inspRef.set({ status: 'final', finalizedAt: ts, finalizedByUid: uid, updatedAt: ts }, { merge: true }),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
    // Append custody event (inspection scope)
    const { prev, headRef } = await getPrevWorm(db, 'inspection', inspectionId);
    const eventId = db.collection('_').doc().id;
    const ev = (0, evidenceStore_1.makeArtifactEvent)({
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
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_write',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'set', path: `inspections/${inspectionId}/artifactEvents/${eventId}` }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => db.doc(`inspections/${inspectionId}/artifactEvents/${eventId}`).set(ev, { merge: false }),
        });
        const auditRef = db.collection('audit').doc('evidenceEvents').collection('events').doc(eventId);
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_write',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'set', path: `audit/evidenceEvents/events/${eventId}` }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => auditRef.set(ev, { merge: false }),
        });
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_write',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'merge', path: headRef.path ?? 'audit/wormHeads/*' }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => setWormHead(headRef, ev.worm),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
    functions.logger.info('finalizeInspection:ok', { inspectionId, correlationId: corr });
    return { ok: true, status: 'final' };
});
//# sourceMappingURL=finalize.js.map