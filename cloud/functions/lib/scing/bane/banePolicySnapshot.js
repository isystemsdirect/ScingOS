"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stableJson = stableJson;
exports.sha256Hex = sha256Hex;
exports.computeSnapshotHash = computeSnapshotHash;
function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}
function stableJson(obj) {
    const seen = new Set();
    const walk = (v) => {
        if (v === null || typeof v !== 'object')
            return v;
        if (seen.has(v))
            return '[Circular]';
        seen.add(v);
        if (Array.isArray(v))
            return v.map(walk);
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
function sha256Hex(s) {
    // Node fast-path.
    try {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(s).digest('hex');
    }
    catch {
        // Minimal fallback: not available.
        throw new Error('SHA256_UNAVAILABLE');
    }
}
function computeSnapshotHash(snapshotUnsigned) {
    return sha256Hex(stableJson(snapshotUnsigned));
}
//# sourceMappingURL=banePolicySnapshot.js.map