"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Hex = sha256Hex;
exports.stableJsonStringify = stableJsonStringify;
function nodeCrypto() {
    try {
        return require('crypto');
    }
    catch {
        return null;
    }
}
function sha256Hex(buf) {
    const crypto = nodeCrypto();
    if (!crypto)
        throw new Error('SHA256_UNAVAILABLE');
    return crypto
        .createHash('sha256')
        .update(buf)
        .digest('hex');
}
function stableJsonStringify(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}
//# sourceMappingURL=evidenceHash.js.map