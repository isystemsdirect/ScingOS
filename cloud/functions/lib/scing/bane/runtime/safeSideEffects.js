"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeSideEffects = safeSideEffects;
const toAuditRecord_1 = require("../storage/toAuditRecord");
function safeSideEffects(config, input, out) {
    // Store: never block, never throw
    try {
        const store = config.store;
        if (store) {
            const rec = (0, toAuditRecord_1.toAuditRecord)(input, out);
            void store.appendAudit(rec).catch(() => { });
            void store
                .appendEvent({
                type: 'BANE_DECISION',
                traceId: out.traceId,
                at: Date.now(),
                data: {
                    verdict: out.verdict,
                    severity: out.severity,
                    enforcementLevel: out.enforcementLevel,
                },
            })
                .catch(() => { });
        }
    }
    catch {
        // swallow
    }
}
//# sourceMappingURL=safeSideEffects.js.map