"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregate = aggregate;
const severityRank = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};
const verdictRank = {
    allow: 1,
    sanitize: 2,
    review: 3,
    deny: 4,
};
function aggregate(findings) {
    if (!findings.length)
        return { verdict: 'allow', severity: 'low' };
    let maxSeverity = 'low';
    let maxVerdict = 'allow';
    for (const f of findings) {
        if (severityRank[f.severity] > severityRank[maxSeverity])
            maxSeverity = f.severity;
        if (verdictRank[f.verdict] > verdictRank[maxVerdict])
            maxVerdict = f.verdict;
    }
    return { verdict: maxVerdict, severity: maxSeverity };
}
//# sourceMappingURL=aggregate.js.map