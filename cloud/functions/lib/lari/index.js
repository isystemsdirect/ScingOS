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
/**
 * LARI (Language and Reasoning Intelligence)
 * AI engines for perception, analysis, and decision support
 */
// Language understanding
exports.understandIntentFunc = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { text } = data;
    const intent = await (0, language_1.understandIntent)(text);
    return { intent };
});
// Vision: Detect defects
exports.detectDefectsFunc = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { imageUrl } = data;
    const defects = await (0, vision_1.detectDefects)(imageUrl);
    return { defects };
});
// Reasoning: Generate report
exports.generateReportFunc = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { inspectionId } = data;
    const report = await (0, reasoning_1.generateReport)(inspectionId);
    return { report };
});
exports.lariRouter = {
    understandIntent: exports.understandIntentFunc,
    detectDefects: exports.detectDefectsFunc,
    generateReport: exports.generateReportFunc,
};
//# sourceMappingURL=index.js.map