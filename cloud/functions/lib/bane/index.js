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
exports.baneRouter = exports.checkPolicyFunc = exports.createSDRFunc = exports.requestCapabilityFunc = void 0;
const functions = __importStar(require("firebase-functions"));
const capability_1 = require("./capability");
const sdr_1 = require("./sdr");
const policy_1 = require("./policy");
/**
 * BANE (Backend Augmented Neural Engine)
 * Security governance and capability-based authorization
 */
// Request capability token
exports.requestCapabilityFunc = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to request capabilities');
    }
    const { action, metadata } = data;
    const userId = context.auth.uid;
    try {
        const token = await (0, capability_1.requestCapability)(userId, action, metadata);
        return { token };
    }
    catch (error) {
        throw new functions.https.HttpsError('permission-denied', error.message);
    }
});
// Create Security Decision Record
exports.createSDRFunc = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const sdrId = await (0, sdr_1.createSDR)({
        userId: context.auth.uid,
        action: data.action,
        result: data.result,
        metadata: data.metadata,
    });
    return { sdrId };
});
// Check if action is allowed by policy
exports.checkPolicyFunc = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { action, resource } = data;
    const userId = context.auth.uid;
    const allowed = await (0, policy_1.checkPolicy)(userId, action, resource);
    return { allowed };
});
exports.baneRouter = {
    requestCapability: exports.requestCapabilityFunc,
    createSDR: exports.createSDRFunc,
    checkPolicy: exports.checkPolicyFunc,
};
//# sourceMappingURL=index.js.map