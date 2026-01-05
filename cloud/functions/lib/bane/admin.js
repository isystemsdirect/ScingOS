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
exports.baneIssuePolicySnapshot = exports.baneRevokeEntitlement = exports.baneIssueEntitlement = void 0;
const functions = __importStar(require("firebase-functions"));
const issue_1 = require("./issue");
const revoke_1 = require("./revoke");
const snapshot_1 = require("./snapshot");
exports.baneIssueEntitlement = functions.https.onCall(async (data, ctx) => {
    const actorUid = ctx.auth?.uid;
    if (!actorUid)
        throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');
    return (0, issue_1.issueEntitlement)(actorUid, data);
});
exports.baneRevokeEntitlement = functions.https.onCall(async (data, ctx) => {
    const actorUid = ctx.auth?.uid;
    if (!actorUid)
        throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');
    return (0, revoke_1.revokeEntitlement)(actorUid, data);
});
exports.baneIssuePolicySnapshot = functions.https.onCall(async (data, ctx) => {
    const uid = ctx.auth?.uid;
    if (!uid)
        throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH');
    const orgId = data?.orgId;
    if (!orgId)
        throw new functions.https.HttpsError('invalid-argument', 'orgId required');
    return (0, snapshot_1.issuePolicySnapshot)(orgId, uid);
});
//# sourceMappingURL=admin.js.map