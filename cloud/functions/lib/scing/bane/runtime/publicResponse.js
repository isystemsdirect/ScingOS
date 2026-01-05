"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePublicMessage = sanitizePublicMessage;
exports.finalizePublicFacing = finalizePublicFacing;
const FORBIDDEN_FRAGMENTS = [
    'system prompt',
    'developer message',
    'detector',
    'regex',
    'pattern',
    'rule',
    'threshold',
    'internal',
    'policy id',
];
function sanitizePublicMessage(msg) {
    const lower = msg.toLowerCase();
    for (const f of FORBIDDEN_FRAGMENTS) {
        if (lower.includes(f)) {
            return 'Request denied by security policy. This attempt has been logged.';
        }
    }
    return msg;
}
function finalizePublicFacing(out) {
    if (out.publicMessage)
        out.publicMessage = sanitizePublicMessage(out.publicMessage);
    return out;
}
//# sourceMappingURL=publicResponse.js.map