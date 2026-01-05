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
exports.revokeEntitlement = void 0;
const admin = __importStar(require("firebase-admin"));
const middleware_1 = require("./middleware");
async function revokeEntitlement(actorUid, req) {
    const db = admin.firestore();
    await (0, middleware_1.assertOrgAdmin)(req.orgId, actorUid);
    const entId = `${req.targetUid}_${req.key}`;
    const entRef = db.doc(`orgs/${req.orgId}/entitlements/${entId}`);
    const prev = await entRef.get();
    if (!prev.exists)
        return { ok: true, entitlementId: entId, alreadyMissing: true };
    const prevData = prev.data();
    const nextPolicyVersion = (Number(prevData.policyVersion ?? 0) || 0) + 1;
    const ts = (0, middleware_1.isoNow)();
    await entRef.set({
        status: 'revoked',
        updatedAt: ts,
        policyVersion: nextPolicyVersion,
        revokeReason: req.reason ?? 'admin_revoke',
    }, { merge: true });
    await db.collection('audit').doc('baneEvents').collection('events').add({
        ts,
        orgId: req.orgId,
        actorUid,
        targetUid: req.targetUid,
        action: 'ENTITLEMENT_REVOKE',
        before: {
            status: prevData.status,
            stage: prevData.stage,
            expiresAt: prevData.expiresAt,
            policyVersion: prevData.policyVersion,
        },
        after: { status: 'revoked', policyVersion: nextPolicyVersion, reason: req.reason ?? 'admin_revoke' },
    });
    return { ok: true, entitlementId: entId, policyVersion: nextPolicyVersion };
}
exports.revokeEntitlement = revokeEntitlement;
//# sourceMappingURL=revoke.js.map