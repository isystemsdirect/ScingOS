"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacSha256Base64Url = hmacSha256Base64Url;
exports.signSnapshotHmac = signSnapshotHmac;
exports.verifySnapshotHmac = verifySnapshotHmac;
function toBase64Url(b64) {
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function constantTimeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let r = 0;
    for (let i = 0; i < a.length; i++)
        r |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return r === 0;
}
function hmacSha256Base64Url(secret, payload) {
    // Node fast-path (Cloud Functions / server).
    try {
        const crypto = require('crypto');
        const b64 = crypto.createHmac('sha256', secret).update(payload).digest('base64');
        return toBase64Url(b64);
    }
    catch {
        throw new Error('HMAC_SHA256_UNAVAILABLE');
    }
}
function signSnapshotHmac(input) {
    const sig = hmacSha256Base64Url(input.secret, input.payload);
    return { alg: 'HS256', kid: input.kid, sig };
}
function verifySnapshotHmac(secret, payload, sig) {
    try {
        const expected = hmacSha256Base64Url(secret, payload);
        return constantTimeEqual(expected, sig);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=baneSignature.js.map