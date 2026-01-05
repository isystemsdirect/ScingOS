"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finding = finding;
exports.runDetectors = runDetectors;
function finding(params) {
    return {
        id: params.id,
        title: params.title,
        severity: params.severity,
        verdict: params.verdict,
        rationale: params.rationale,
        tags: params.tags,
        evidence: params.evidence,
    };
}
function runDetectors(detectors, input, hints) {
    const sorted = [...detectors].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    const out = [];
    for (const d of sorted) {
        const res = d.detect(input, hints);
        if (res && res.length)
            out.push(...res);
    }
    return out;
}
//# sourceMappingURL=detectors.js.map