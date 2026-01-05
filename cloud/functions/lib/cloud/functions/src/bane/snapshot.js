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
exports.issuePolicySnapshot = issuePolicySnapshot;
const admin = __importStar(require("firebase-admin"));
const middleware_1 = require("./middleware");
const banePolicySnapshot_1 = require("../../../../scing/bane/banePolicySnapshot");
const baneSignature_1 = require("../../../../scing/bane/baneSignature");
async function issuePolicySnapshot(orgId, uid) {
    const db = admin.firestore();
    // roles
    const mem = await db.doc(`orgs/${orgId}/members/${uid}`).get();
    if (!mem.exists)
        throw new Error('NO_ROLE');
    const role = mem.data().role;
    // entitlements
    const entsSnap = await db.collection(`orgs/${orgId}/entitlements`).where('uid', '==', uid).get();
    const entitlements = {};
    let maxPolicyVersion = 0;
    entsSnap.forEach((d) => {
        const e = d.data();
        const key = e.key;
        entitlements[key] = {
            uid: e.uid,
            key: e.key,
            stage: e.stage,
            status: e.status,
            issuedAt: e.issuedAt,
            expiresAt: e.expiresAt,
            graceUntil: e.graceUntil ?? undefined,
            seatBound: Boolean(e.seatBound),
            deviceBound: Boolean(e.deviceBound),
            allowedDeviceIds: e.allowedDeviceIds ?? [],
            caps: e.caps ?? [],
            policyVersion: e.policyVersion ?? 0,
            updatedAt: e.updatedAt,
        };
        maxPolicyVersion = Math.max(maxPolicyVersion, Number(e.policyVersion ?? 0) || 0);
    });
    // constraints (tight defaults; relax only by plan tier later)
    const constraints = {
        offlineAllowed: true,
        offlineHardDenyExternalHardware: true,
        offlineHardDenyPhysicalControl: true,
        maxOfflineSeconds: 6 * 60 * 60, // 6 hours
    };
    const issuedAt = (0, middleware_1.isoNow)();
    const expiresAt = new Date(Date.now() + constraints.maxOfflineSeconds * 1000).toISOString();
    const unsigned = {
        uid,
        orgId,
        issuedAt,
        expiresAt,
        policyVersion: maxPolicyVersion,
        roles: { [uid]: role },
        entitlements,
        constraints,
    };
    const hash = (0, banePolicySnapshot_1.computeSnapshotHash)(unsigned);
    const kid = (0, middleware_1.mustEnv)('BANE_SNAPSHOT_KID');
    const secret = (0, middleware_1.mustEnv)('BANE_SNAPSHOT_HMAC_SECRET');
    const payload = JSON.stringify({ ...unsigned, hash });
    const signature = (0, baneSignature_1.signSnapshotHmac)({ kid, secret, payload });
    const snapshot = { ...unsigned, hash, signature };
    await db.doc(`orgs/${orgId}/policySnapshots/${uid}`).set(snapshot, { merge: true });
    await db.collection('audit').doc('baneEvents').collection('events').add({
        ts: issuedAt,
        orgId,
        actorUid: uid,
        targetUid: uid,
        action: 'SNAPSHOT_ISSUE',
        after: { policyVersion: maxPolicyVersion, expiresAt },
    });
    return snapshot;
}
//# sourceMappingURL=snapshot.js.map