"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBaneHttpGuard = makeBaneHttpGuard;
const liveBaneEngine_1 = require("../runtime/liveBaneEngine");
function makeBaneHttpGuard(config) {
    const engine = (0, liveBaneEngine_1.createLiveBaneEngine)(config);
    return function guard(req) {
        const input = {
            text: req.bodyText ?? '',
            req: {
                route: req.path ?? 'http:unknown',
                requiredCapability: 'bane:invoke',
                auth: {
                    identityId: req.identityId,
                    sessionId: req.sessionId,
                    ipHash: req.ipHash,
                    capabilities: req.capabilities,
                    isAuthenticated: Boolean(req.identityId),
                    sessionIntegrity: req.sessionIntegrity,
                },
            },
        };
        const out = engine.evaluate(input);
        if (out.verdict === 'deny') {
            const status = out.enforcementLevel === 4 ? 423 : out.enforcementLevel === 5 ? 403 : 403;
            return {
                ok: false,
                status,
                message: out.publicMessage ?? 'Access denied by policy.',
                traceId: out.traceId,
                retryAfterMs: out.throttle && out.throttle.action === 'block' ? out.throttle.retryAfterMs : undefined,
            };
        }
        if (out.verdict === 'review') {
            return {
                ok: false,
                status: 401,
                message: out.publicMessage ?? 'Additional authorization required.',
                traceId: out.traceId,
            };
        }
        return { ok: true, traceId: out.traceId };
    };
}
//# sourceMappingURL=httpMiddleware.js.map