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
exports.aipRouter = exports.handleMessage = void 0;
const functions = __importStar(require("firebase-functions"));
/**
 * AIP (Augmented Intelligence Portal)
 * Real-time communication protocol handlers
 */
// AIP message handler
exports.handleMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { type, payload } = data;
    switch (type) {
        case 'task.request':
            return await handleTaskRequest(payload, context.auth.uid);
        case 'context.update':
            return await handleContextUpdate(payload, context.auth.uid);
        default:
            throw new functions.https.HttpsError('invalid-argument', `Unknown message type: ${type}`);
    }
});
async function handleTaskRequest(payload, userId) {
    // Extract only the action - params will be accessed from payload when routing is implemented
    const { action } = payload;
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
    const { updates } = payload;
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