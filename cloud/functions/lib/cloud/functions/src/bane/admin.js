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
exports.baneIssuePolicySnapshot = exports.baneRevokeEntitlement = exports.baneIssueEntitlement = void 0;
const functions = __importStar(require("firebase-functions"));
const issue_1 = require("./issue");
const revoke_1 = require("./revoke");
const snapshot_1 = require("./snapshot");
const enforce_1 = require("./enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
exports.baneIssueEntitlement = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'baneIssueEntitlement', data, ctx });
    try {
        return await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'bane_issueEntitlement',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'issueEntitlement' }),
            identityId: gate.uid,
            capabilities: gate.capabilities,
            exec: async () => (0, issue_1.issueEntitlement)(gate.uid, data),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
exports.baneRevokeEntitlement = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'baneRevokeEntitlement', data, ctx });
    try {
        return await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'bane_revokeEntitlement',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'revokeEntitlement' }),
            identityId: gate.uid,
            capabilities: gate.capabilities,
            exec: async () => (0, revoke_1.revokeEntitlement)(gate.uid, data),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
exports.baneIssuePolicySnapshot = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'baneIssuePolicySnapshot', data, ctx });
    const orgId = data?.orgId;
    if (!orgId)
        throw new functions.https.HttpsError('invalid-argument', 'orgId required');
    try {
        return await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'bane_issuePolicySnapshot',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'issuePolicySnapshot', orgId: String(orgId) }),
            identityId: gate.uid,
            capabilities: gate.capabilities,
            exec: async () => (0, snapshot_1.issuePolicySnapshot)(orgId, gate.uid),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
//# sourceMappingURL=admin.js.map