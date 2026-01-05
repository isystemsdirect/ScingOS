"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIntegrity = checkIntegrity;
const seenNonces = new Map();
function checkIntegrity(input) {
    const auth = input.req?.auth;
    const nonce = auth?.nonce;
    const now = Date.now();
    if (nonce) {
        const prev = seenNonces.get(nonce);
        if (prev && now - prev < 10 * 60 * 1000)
            return { ok: false, code: 'REPLAY' };
        seenNonces.set(nonce, now);
        if (seenNonces.size > 10000) {
            const firstKey = seenNonces.keys().next().value;
            if (firstKey)
                seenNonces.delete(firstKey);
        }
    }
    // Signature verification is environment-specific; hook only.
    // If your gateway provides signature validation upstream, leave this as ok.
    return { ok: true };
}
//# sourceMappingURL=integrity.js.map