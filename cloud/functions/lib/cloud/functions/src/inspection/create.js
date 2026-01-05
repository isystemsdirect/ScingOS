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
exports.createInspection = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const enforce_1 = require("../bane/enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
function isoNow() {
    return new Date().toISOString();
}
exports.createInspection = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'createInspection', data, ctx });
    const uid = gate.uid;
    const { orgId, title, description, location, addressText, domainKey, domainVersion } = data ?? {};
    if (!orgId || !title)
        throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
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
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_write',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ collection: 'inspections', op: 'set', docId: inspectionId }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => db.doc(`inspections/${inspectionId}`).set(record, { merge: false }),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
    return { ok: true, inspectionId, record };
});
//# sourceMappingURL=create.js.map