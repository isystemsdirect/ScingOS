"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIncidentRecord = toIncidentRecord;
function toIncidentRecord(out, ctx) {
    return {
        traceId: out.traceId,
        occurredAt: Date.now(),
        identityId: ctx?.identityId,
        sessionId: ctx?.sessionId,
        ipHash: ctx?.ipHash,
        enforcementLevel: out.enforcementLevel ?? 0,
        verdict: out.verdict,
        severity: out.severity,
        findingsSummary: (out.findings ?? []).map((f) => ({ id: f.id, severity: f.severity, verdict: f.verdict })),
    };
}
//# sourceMappingURL=incident.js.map