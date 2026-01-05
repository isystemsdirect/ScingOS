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
exports.aipRouter = exports.handleMessage = void 0;
const functions = __importStar(require("firebase-functions"));
const safe_1 = require("../shared/types/safe");
const enforce_1 = require("../bane/enforce");
/**
 * AIP (Augmented Intelligence Portal)
 * Real-time communication protocol handlers
 */
// AIP message handler
exports.handleMessage = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'aip.handleMessage', data, ctx: context });
    const uid = gate.uid;
    const { type, payload } = data;
    switch (type) {
        case 'task.request':
            return await handleTaskRequest(payload, uid);
        case 'context.update':
            return await handleContextUpdate(payload, uid);
        default:
            throw new functions.https.HttpsError('invalid-argument', `Unknown message type: ${type}`);
    }
});
async function handleTaskRequest(payload, userId) {
    const p = (0, safe_1.getRecord)(payload, 'aip.taskRequest');
    const action = (0, safe_1.asString)(p.action);
    console.log(`Task request from ${userId}: ${action}`);
    // Route to appropriate handler
    // TODO: Implement actual routing logic
    return {
        status: 'success',
        result: {
            message: `Task '${action}' processed`,
        },
    };
}
async function handleContextUpdate(payload, userId) {
    const p = (0, safe_1.getRecord)(payload, 'aip.contextUpdate');
    const updates = p.updates;
    console.log(`Context update from ${userId}:`, updates);
    // Update session context in Firestore
    // TODO: Implement context storage
    return {
        status: 'success',
    };
}
exports.aipRouter = {
    handleMessage: exports.handleMessage,
};
//# sourceMappingURL=index.js.map