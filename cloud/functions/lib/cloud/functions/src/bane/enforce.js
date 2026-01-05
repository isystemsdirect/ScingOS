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
exports.resolveCapabilities = resolveCapabilities;
exports.enforceBaneCallable = enforceBaneCallable;
exports.enforceBaneHttp = enforceBaneHttp;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const baneGuards_1 = require("../../../../scing/bane/server/baneGuards");
function safeJson(value) {
    try {
        return JSON.stringify(value ?? {});
    }
    catch {
        return '';
    }
}
function capsForRole(role) {
    const r = (role ?? '').toLowerCase();
    if (r === 'admin')
        return ['bane:invoke', 'tool:db_read', 'tool:db_write', 'tool:external_call'];
    if (r === 'inspector')
        return ['bane:invoke', 'tool:db_read', 'tool:db_write'];
    if (r === 'viewer')
        return ['bane:invoke', 'tool:db_read'];
    return ['bane:invoke'];
}
async function resolveRoleFromFirestore(uid) {
    const snap = await admin.firestore().collection('users').doc(uid).get();
    const role = snap.exists ? snap.data()?.role : undefined;
    return typeof role === 'string' ? role : undefined;
}
async function resolveCapabilities(params) {
    const tokenRole = typeof params.token?.role === 'string' ? String(params.token.role) : undefined;
    const tokenCaps = Array.isArray(params.token?.caps) ? params.token.caps.map(String) : null;
    if (tokenCaps && tokenCaps.length > 0)
        return ['bane:invoke', ...tokenCaps];
    const role = tokenRole ?? (await resolveRoleFromFirestore(params.uid));
    return capsForRole(role);
}
async function enforceBaneCallable(params) {
    const uid = params.ctx.auth?.uid;
    // Run BANE even on unauthenticated attempts (fail-closed + traceId).
    if (!uid) {
        const decision = (0, baneGuards_1.baneHttpGuard)({
            path: `fn:${params.name}`,
            bodyText: safeJson(params.data),
            identityId: undefined,
            capabilities: undefined,
            sessionIntegrity: { nonceOk: false, signatureOk: false, tokenFresh: false },
        });
        const traceId = decision.ok ? 'unknown' : decision.traceId;
        throw new functions.https.HttpsError('unauthenticated', 'NO_AUTH', { traceId });
    }
    const capabilities = await resolveCapabilities({ uid, token: params.ctx.auth?.token });
    const decision = (0, baneGuards_1.baneHttpGuard)({
        path: `fn:${params.name}`,
        bodyText: safeJson(params.data),
        identityId: uid,
        capabilities,
        sessionIntegrity: { nonceOk: true, signatureOk: true, tokenFresh: true },
    });
    if (!decision.ok) {
        const code = decision.retryAfterMs ? 'resource-exhausted' : 'permission-denied';
        throw new functions.https.HttpsError(code, decision.message, {
            traceId: decision.traceId,
            retryAfterMs: decision.retryAfterMs ?? null,
        });
    }
    return { traceId: decision.traceId, uid, capabilities };
}
function enforceBaneHttp(params) {
    const headers = {};
    for (const [k, v] of Object.entries(params.req.headers)) {
        headers[k] = Array.isArray(v) ? v[0] : v;
    }
    const decision = (0, baneGuards_1.baneHttpGuard)({
        path: params.req.path ? String(params.req.path) : `http:${params.name}`,
        headers,
        bodyText: params.bodyText ?? '',
        identityId: params.identityId,
        capabilities: params.capabilities,
        sessionIntegrity: params.identityId
            ? { nonceOk: true, signatureOk: true, tokenFresh: true }
            : { nonceOk: false, signatureOk: false, tokenFresh: false },
    });
    if (!decision.ok) {
        params.res.setHeader('x-bane-trace-id', decision.traceId);
        if (decision.retryAfterMs) {
            params.res.setHeader('retry-after', String(Math.ceil(decision.retryAfterMs / 1000)));
        }
        params.res.status(decision.status).json({ ok: false, message: decision.message, traceId: decision.traceId });
        return { ok: false };
    }
    params.res.setHeader('x-bane-trace-id', decision.traceId);
    return { ok: true, traceId: decision.traceId };
}
//# sourceMappingURL=enforce.js.map