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
exports.baneIssuePolicySnapshot = exports.baneRevokeEntitlement = exports.baneIssueEntitlement = exports.baneRouter = exports.checkPolicyFunc = exports.createSDRFunc = exports.requestCapabilityFunc = void 0;
const functions = __importStar(require("firebase-functions"));
const capability_1 = require("./capability");
const sdr_1 = require("./sdr");
const policy_1 = require("./policy");
const admin_1 = require("./admin");
Object.defineProperty(exports, "baneIssueEntitlement", { enumerable: true, get: function () { return admin_1.baneIssueEntitlement; } });
Object.defineProperty(exports, "baneIssuePolicySnapshot", { enumerable: true, get: function () { return admin_1.baneIssuePolicySnapshot; } });
Object.defineProperty(exports, "baneRevokeEntitlement", { enumerable: true, get: function () { return admin_1.baneRevokeEntitlement; } });
const enforce_1 = require("./enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
/**
 * BANE (Backend Augmented Neural Engine)
 * Security governance and capability-based authorization
 */
// Request capability token
exports.requestCapabilityFunc = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'requestCapabilityFunc', data, ctx: context });
    const { action, metadata } = data;
    const userId = gate.uid;
    try {
        const token = await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'bane_requestCapability',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ action: action ? String(action) : null }),
            identityId: userId,
            capabilities: gate.capabilities,
            exec: async () => (0, capability_1.requestCapability)(userId, action, metadata),
        });
        return { token };
    }
    catch (error) {
        if (error?.baneTraceId) {
            throw new functions.https.HttpsError('permission-denied', error.message, {
                traceId: error.baneTraceId,
            });
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new functions.https.HttpsError('permission-denied', message);
    }
});
// Create Security Decision Record
exports.createSDRFunc = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'createSDRFunc', data, ctx: context });
    try {
        const sdrId = await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'bane_createSDR',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ action: data?.action ? String(data.action) : null }),
            identityId: gate.uid,
            capabilities: gate.capabilities,
            exec: async () => (0, sdr_1.createSDR)({
                userId: gate.uid,
                action: data.action,
                result: data.result,
                metadata: data.metadata,
            }),
        });
        return { sdrId };
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
// Check if action is allowed by policy
exports.checkPolicyFunc = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'checkPolicyFunc', data, ctx: context });
    const { action, resource } = data;
    const userId = gate.uid;
    try {
        const allowed = await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'bane_checkPolicy',
            requiredCapability: 'tool:db_read',
            payloadText: JSON.stringify({ action: action ? String(action) : null }),
            identityId: userId,
            capabilities: gate.capabilities,
            exec: async () => (0, policy_1.checkPolicy)(userId, action, resource),
        });
        return { allowed };
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
exports.baneRouter = {
    requestCapability: exports.requestCapabilityFunc,
    createSDR: exports.createSDRFunc,
    checkPolicy: exports.checkPolicyFunc,
    issueEntitlement: admin_1.baneIssueEntitlement,
    revokeEntitlement: admin_1.baneRevokeEntitlement,
    issuePolicySnapshot: admin_1.baneIssuePolicySnapshot,
};
//# sourceMappingURL=index.js.map