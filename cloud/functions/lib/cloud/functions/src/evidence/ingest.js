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
exports.evidenceFinalizeArtifact = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const evidenceSign_1 = require("../../../../scing/evidence/evidenceSign");
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
exports.evidenceFinalizeArtifact = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'evidenceFinalizeArtifact', data, ctx });
    const uid = gate.uid;
    const { orgId, inspectionId, artifactId, contentHash, signature, signer } = data ?? {};
    if (!orgId || !inspectionId || !artifactId || !contentHash) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
    }
    const db = admin.firestore();
    const artRefPath = `inspections/${inspectionId}/artifacts/${artifactId}`;
    const artRef = db.doc(artRefPath);
    const artSnap = await artRef.get();
    if (!artSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Artifact missing');
    }
    const art = artSnap.data();
    if (art.orgId !== orgId) {
        throw new functions.https.HttpsError('permission-denied', 'ORG_MISMATCH');
    }
    if (art.integrity?.contentHash && art.integrity.contentHash !== contentHash) {
        throw new functions.https.HttpsError('failed-precondition', 'HASH_MISMATCH');
    }
    let integrityState = 'pending';
    let failureReason;
    if (signature && signer === 'server') {
        integrityState = 'verified';
    }
    if (signature?.alg === 'EdDSA' && signer === 'device') {
        const deviceId = art.provenance?.capturedOn?.deviceId;
        if (!deviceId)
            throw new functions.https.HttpsError('failed-precondition', 'NO_DEVICE');
        const devSnap = await db.doc(`orgs/${orgId}/devices/${deviceId}`).get();
        const pub = devSnap.data()?.publicKeyPem;
        if (!pub)
            throw new functions.https.HttpsError('failed-precondition', 'NO_DEVICE_PUBKEY');
        const payload = JSON.stringify({ orgId, inspectionId, artifactId, contentHash });
        const ok = (0, evidenceSign_1.verifyEd25519Base64Url)(pub, payload, signature.sig);
        integrityState = ok ? 'verified' : 'failed';
        if (!ok)
            failureReason = 'BAD_SIGNATURE';
    }
    const ts = isoNow();
    try {
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_write',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'merge', path: artRefPath, finalized: true }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => artRef.set({
                integrity: {
                    contentHash,
                    hashAlg: 'sha256',
                    signature: signature
                        ? { ...signature, signedAt: ts, signer }
                        : admin.firestore.FieldValue.delete(),
                    integrityState,
                    verifiedAt: integrityState === 'verified' ? ts : admin.firestore.FieldValue.delete(),
                    failureReason: failureReason ?? admin.firestore.FieldValue.delete(),
                },
                finalized: true,
                updatedAt: ts,
            }, { merge: true }),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
    const { prev, headRef } = await getPrevWorm(db, 'artifact', artifactId);
    const eventId = db.collection('_').doc().id;
    const ev = (0, evidenceStore_1.makeArtifactEvent)({
        eventId,
        orgId,
        inspectionId,
        artifactId,
        type: 'VERIFIED',
        ts,
        actor: { uid, orgId },
        device: art.provenance?.capturedOn ?? undefined,
        engineId: art.provenance?.engineId ?? undefined,
        details: { integrityState, failureReason: failureReason ?? null },
        prevWorm: prev,
        wormScope: 'artifact',
        wormScopeId: artifactId,
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
    return { ok: true, integrityState };
});
//# sourceMappingURL=ingest.js.map