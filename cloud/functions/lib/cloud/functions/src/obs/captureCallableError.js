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
exports.captureCallableError = captureCallableError;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Helper wrapper for future use: wrap callables to auto-log thrown errors.
// Note: this writes directly to Firestore (best-effort) and then rethrows.
function captureCallableError(name, fn) {
    return functions.https.onCall(async (data, ctx) => {
        try {
            return await fn(data, ctx);
        }
        catch (err) {
            try {
                const uid = ctx.auth?.uid ?? null;
                const eventId = `fnerr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
                await admin
                    .firestore()
                    .doc(`obs/events/${eventId}`)
                    .set({
                    eventId,
                    createdAt: new Date().toISOString(),
                    orgId: data?.orgId ? String(data.orgId) : null,
                    uid,
                    deviceId: data?.deviceId ? String(data.deviceId) : null,
                    severity: 'critical',
                    scope: 'function',
                    correlationId: data?.correlationId ? String(data.correlationId) : `corr_${Date.now()}`,
                    inspectionId: data?.inspectionId ? String(data.inspectionId) : null,
                    engineId: data?.engineId ? String(data.engineId) : null,
                    phase: data?.phase ? String(data.phase) : null,
                    message: `Callable error: ${name}`,
                    errorName: err?.name ? String(err.name).slice(0, 200) : null,
                    errorStack: err?.stack ? String(err.stack).slice(0, 12000) : null,
                    tags: ['callable:error'],
                    meta: {
                        dataKeys: Object.keys(data ?? {}),
                        code: err?.code ?? null,
                    },
                    flushedAt: new Date().toISOString(),
                }, { merge: false });
            }
            catch {
                // ignore
            }
            throw err;
        }
    });
}
//# sourceMappingURL=captureCallableError.js.map