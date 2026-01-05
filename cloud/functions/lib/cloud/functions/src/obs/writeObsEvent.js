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
exports.writeObsEvent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const githubNotify_1 = require("./githubNotify");
const enforce_1 = require("../bane/enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
const SECRET_KEYS = new Set([
    'password',
    'pass',
    'token',
    'idToken',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'privateKey',
    'authorization',
]);
function redact(value) {
    if (value == null)
        return value;
    if (typeof value === 'string') {
        return value.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/g, 'Bearer [REDACTED]');
    }
    if (Array.isArray(value))
        return value.map(redact);
    if (typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (SECRET_KEYS.has(k))
                out[k] = '[REDACTED]';
            else
                out[k] = redact(v);
        }
        return out;
    }
    return value;
}
exports.writeObsEvent = functions.https.onCall(async (data, ctx) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'writeObsEvent', data, ctx });
    const uid = gate.uid;
    const evt = data?.event;
    if (!evt?.eventId ||
        !evt?.createdAt ||
        !evt?.severity ||
        !evt?.scope ||
        !evt?.correlationId ||
        !evt?.message) {
        throw new functions.https.HttpsError('invalid-argument', 'BAD_EVENT');
    }
    // Minimize sensitive fields server-side as a second-pass defense
    const sanitized = {
        eventId: String(evt.eventId),
        createdAt: String(evt.createdAt),
        orgId: evt.orgId ? String(evt.orgId) : null,
        uid,
        deviceId: evt.deviceId ? String(evt.deviceId) : null,
        severity: String(evt.severity),
        scope: String(evt.scope),
        correlationId: String(evt.correlationId),
        inspectionId: evt.inspectionId ? String(evt.inspectionId) : null,
        engineId: evt.engineId ? String(evt.engineId) : null,
        phase: evt.phase ? String(evt.phase) : null,
        message: String(evt.message).slice(0, 2000),
        errorName: evt.errorName ? String(evt.errorName).slice(0, 200) : null,
        errorStack: evt.errorStack ? String(evt.errorStack).slice(0, 12000) : null,
        tags: Array.isArray(evt.tags) ? evt.tags.slice(0, 20).map(String) : [],
        meta: redact(evt.meta ?? null),
        flushedAt: evt.flushedAt ? String(evt.flushedAt) : null,
    };
    const db = admin.firestore();
    try {
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'firestore_write',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ op: 'set', path: `obs/events/${sanitized.eventId}` }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => db.doc(`obs/events/${sanitized.eventId}`).set(sanitized, { merge: false }),
        });
    }
    catch (e) {
        if (e?.baneTraceId)
            throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
        throw e;
    }
    // Best-effort GitHub notify; never fail the write on notify errors.
    try {
        await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'external_call',
            requiredCapability: 'tool:external_call',
            payloadText: JSON.stringify({ host: 'api.github.com', method: 'POST', kind: 'issues.create' }),
            identityId: uid,
            capabilities: gate.capabilities,
            exec: async () => (0, githubNotify_1.maybeNotifyGitHubOnCritical)(sanitized),
        });
    }
    catch {
        // ignore
    }
    return { ok: true };
});
//# sourceMappingURL=writeObsEvent.js.map