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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueEntitlement = void 0;
const admin = __importStar(require("firebase-admin"));
const middleware_1 = require("./middleware");
const baneKeys_1 = require("../../../scing/bane/baneKeys");
async function issueEntitlement(actorUid, req) {
    const db = admin.firestore();
    await (0, middleware_1.assertOrgAdmin)(req.orgId, actorUid);
    const stage = req.stage ?? baneKeys_1.KEY_STAGE_DEFAULT[req.key];
    const days = req.days ?? 30;
    const issuedAt = (0, middleware_1.isoNow)();
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const entId = `${req.targetUid}_${req.key}`;
    const entRef = db.doc(`orgs/${req.orgId}/entitlements/${entId}`);
    const prev = await entRef.get();
    const prevData = prev.exists ? prev.data() : null;
    const nextPolicyVersion = (Number(prevData?.policyVersion ?? 0) || 0) + 1;
    const caps = req.caps ?? baneKeys_1.KEY_CAPS[req.key];
    const next = {
        uid: req.targetUid,
        orgId: req.orgId,
        key: req.key,
        stage,
        status: 'active',
        issuedAt,
        expiresAt,
        graceUntil: null,
        seatBound: Boolean(req.seatBound),
        deviceBound: Boolean(req.deviceBound),
        allowedDeviceIds: req.allowedDeviceIds ?? [],
        caps,
        policyVersion: nextPolicyVersion,
        updatedAt: issuedAt,
    };
    await entRef.set(next, { merge: true });
    await db.collection('audit').doc('baneEvents').collection('events').add({
        ts: issuedAt,
        orgId: req.orgId,
        actorUid,
        targetUid: req.targetUid,
        action: prev.exists ? 'ENTITLEMENT_RENEW' : 'ENTITLEMENT_ISSUE',
        before: prevData
            ? {
                status: prevData.status,
                stage: prevData.stage,
                expiresAt: prevData.expiresAt,
                policyVersion: prevData.policyVersion,
            }
            : null,
        after: {
            status: next.status,
            stage: next.stage,
            expiresAt: next.expiresAt,
            policyVersion: next.policyVersion,
        },
    });
    return { ok: true, entitlementId: entId, policyVersion: nextPolicyVersion };
}
exports.issueEntitlement = issueEntitlement;
//# sourceMappingURL=issue.js.map