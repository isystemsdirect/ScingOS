"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortFindings = sortFindings;
const sRank = { low: 1, medium: 2, high: 3, critical: 4 };
const vRank = { allow: 1, sanitize: 2, review: 3, deny: 4 };
function sortFindings(findings) {
    return [...findings].sort((a, b) => {
        const sd = sRank[b.severity] - sRank[a.severity];
        if (sd !== 0)
            return sd;
        const vd = vRank[b.verdict] - vRank[a.verdict];
        if (vd !== 0)
            return vd;
        return a.id.localeCompare(b.id);
    });
}
//# sourceMappingURL=sortFindings.js.map