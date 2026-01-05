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
exports.exportInspectionReport = void 0;
const functions = __importStar(require("firebase-functions"));
const exportSigner_1 = require("../../../../scing/ui/exportSigner");
const safe_1 = require("../shared/types/safe");
const enforce_1 = require("../bane/enforce");
exports.exportInspectionReport = functions.https.onCall(async (data, ctx) => {
    await (0, enforce_1.enforceBaneCallable)({ name: 'exportInspectionReport', data, ctx });
    const { report } = data ?? {};
    if (!report)
        throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
    const envKey = process.env.SCING_REPORT_SIGNING_KEY_PEM;
    const cfg = functions.config?.();
    const cfgKey = (0, safe_1.isRecord)(cfg) && (0, safe_1.isRecord)(cfg.scing)
        ? (0, safe_1.asString)(cfg.scing.report_signing_key_pem)
        : '';
    const privateKeyPem = envKey || cfgKey;
    if (!privateKeyPem) {
        throw new functions.https.HttpsError('failed-precondition', 'SIGNING_KEY_NOT_CONFIGURED');
    }
    const signature = (0, exportSigner_1.signReport)(report, privateKeyPem);
    return { report, signature, signedAt: new Date().toISOString() };
});
//# sourceMappingURL=export.js.map