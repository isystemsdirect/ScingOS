"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signEd25519Base64Url = signEd25519Base64Url;
exports.verifyEd25519Base64Url = verifyEd25519Base64Url;
function nodeCrypto() {
    try {
        return require('crypto');
    }
    catch {
        return null;
    }
}
function toBase64Url(b64) {
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function signEd25519Base64Url(privateKeyPem, payload) {
    const crypto = nodeCrypto();
    if (!crypto)
        throw new Error('ED25519_UNAVAILABLE');
    const sig = crypto.sign(null, Buffer.from(payload), privateKeyPem).toString('base64');
    return toBase64Url(sig);
}
function verifyEd25519Base64Url(publicKeyPem, payload, sigB64Url) {
    const crypto = nodeCrypto();
    if (!crypto)
        return false;
    const b64 = sigB64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64 + '==='.slice((b64.length + 3) % 4);
    const sig = Buffer.from(pad, 'base64');
    return crypto.verify(null, Buffer.from(payload), publicKeyPem, sig);
}
//# sourceMappingURL=evidenceSign.js.map