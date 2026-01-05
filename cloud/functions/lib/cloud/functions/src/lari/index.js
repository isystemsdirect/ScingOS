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
exports.lariRouter = exports.generateReportFunc = exports.detectDefectsFunc = exports.understandIntentFunc = void 0;
const functions = __importStar(require("firebase-functions"));
const language_1 = require("./language");
const vision_1 = require("./vision");
const reasoning_1 = require("./reasoning");
const enforce_1 = require("../bane/enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
/**
 * LARI (Language and Reasoning Intelligence)
 * AI engines for perception, analysis, and decision support
 */
// Language understanding
exports.understandIntentFunc = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'lari.understandIntent', data, ctx: context });
    const { text } = data;
    try {
        const intent = await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'lari_understandIntent',
            requiredCapability: 'tool:external_call',
            payloadText: JSON.stringify({ text: typeof text === 'string' ? text.slice(0, 200) : null }),
            identityId: gate.uid,
            capabilities: gate.capabilities,
            exec: async () => (0, language_1.understandIntent)(text),
        });
        return { intent };
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
// Vision: Detect defects
exports.detectDefectsFunc = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'lari.detectDefects', data, ctx: context });
    const { imageUrl } = data;
    try {
        const defects = await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'lari_detectDefects',
            requiredCapability: 'tool:external_call',
            payloadText: JSON.stringify({ imageUrl: typeof imageUrl === 'string' ? imageUrl.slice(0, 500) : null }),
            identityId: gate.uid,
            capabilities: gate.capabilities,
            exec: async () => (0, vision_1.detectDefects)(imageUrl),
        });
        return { defects };
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
// Reasoning: Generate report
exports.generateReportFunc = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'lari.generateReport', data, ctx: context });
    const { inspectionId } = data;
    try {
        const report = await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'lari_generateReport',
            requiredCapability: 'tool:db_read',
            payloadText: JSON.stringify({ inspectionId: inspectionId ? String(inspectionId) : null }),
            identityId: gate.uid,
            capabilities: gate.capabilities,
            exec: async () => (0, reasoning_1.generateReport)(inspectionId),
        });
        return { report };
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
});
exports.lariRouter = {
    understandIntent: exports.understandIntentFunc,
    detectDefects: exports.detectDefectsFunc,
    generateReport: exports.generateReportFunc,
};
//# sourceMappingURL=index.js.map