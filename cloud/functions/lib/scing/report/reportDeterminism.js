"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stableSort = stableSort;
exports.stableSeverityRank = stableSeverityRank;
exports.stableJsonDeep = stableJsonDeep;
function stableSort(items, key) {
    return [...items].sort((a, b) => {
        const ka = key(a);
        const kb = key(b);
        return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
}
function stableSeverityRank(sev) {
    if (sev === 'critical')
        return 0;
    if (sev === 'major')
        return 1;
    if (sev === 'minor')
        return 2;
    return 3;
}
function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}
function stableJsonDeep(obj) {
    const seen = new Set();
    const walk = (v) => {
        if (v === null || typeof v !== 'object')
            return v;
        if (seen.has(v))
            return '[Circular]';
        seen.add(v);
        if (Array.isArray(v))
            return v.map((x) => walk(x));
        if (isPlainObject(v)) {
            const out = {};
            for (const k of Object.keys(v).sort())
                out[k] = walk(v[k]);
            return out;
        }
        return v;
    };
    return JSON.stringify(walk(obj));
}
//# sourceMappingURL=reportDeterminism.js.map