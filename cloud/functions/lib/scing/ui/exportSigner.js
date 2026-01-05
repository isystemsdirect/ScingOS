"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signReport = signReport;
function nodeCrypto() {
    try {
        return require('crypto');
    }
    catch {
        return null;
    }
}
function signReport(payload, privateKeyPem) {
    const crypto = nodeCrypto();
    if (!crypto)
        throw new Error('CRYPTO_UNAVAILABLE');
    const data = Buffer.from(JSON.stringify(payload));
    try {
        // Works for Ed25519/Ed448 keys.
        const sig = crypto.sign(null, data, privateKeyPem);
        return sig.toString('base64');
    }
    catch {
        // Fallback for RSA/ECDSA keys.
        const sig = crypto.sign('sha256', data, privateKeyPem);
        return sig.toString('base64');
    }
}
//# sourceMappingURL=exportSigner.js.map