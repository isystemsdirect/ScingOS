"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuditRecord = toAuditRecord;
const hash_1 = require("./hash");
function toAuditRecord(input, out) {
    return {
        at: Date.now(),
        traceId: out.traceId,
        route: String(input.req?.route ?? 'unknown'),
        requiredCapability: input.req?.requiredCapability,
        identityId: input.req?.auth?.identityId,
        verdict: out.verdict,
        severity: out.severity,
        enforcementLevel: out.enforcementLevel,
        textHash: (0, hash_1.sha256Hex)(input.text ?? ''),
        findingsSummary: (out.findings ?? []).map((f) => ({ id: f.id, severity: f.severity, verdict: f.verdict })),
    };
}
//# sourceMappingURL=toAuditRecord.js.map