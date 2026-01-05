"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBaneToolGuard = makeBaneToolGuard;
const liveBaneEngine_1 = require("../runtime/liveBaneEngine");
function makeBaneToolGuard(config) {
    const engine = (0, liveBaneEngine_1.createLiveBaneEngine)(config);
    return function guard(ctx) {
        const input = {
            text: ctx.payloadText,
            req: {
                route: `tool:${ctx.toolName}`,
                requiredCapability: ctx.requiredCapability,
                auth: {
                    identityId: ctx.identityId,
                    sessionId: ctx.sessionId,
                    ipHash: ctx.ipHash,
                    capabilities: ctx.capabilities,
                    isAuthenticated: Boolean(ctx.identityId),
                    sessionIntegrity: ctx.sessionIntegrity,
                },
            },
        };
        const out = engine.evaluate(input);
        if (out.verdict === 'deny' || out.verdict === 'review') {
            return { ok: false, traceId: out.traceId, message: out.publicMessage ?? 'Tool invocation blocked by policy.' };
        }
        return { ok: true, traceId: out.traceId };
    };
}
//# sourceMappingURL=toolGuard.js.map