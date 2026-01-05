"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEventHash = computeEventHash;
exports.nextWormRef = nextWormRef;
const evidenceHash_1 = require("./evidenceHash");
function computeEventHash(payload) {
    return (0, evidenceHash_1.sha256Hex)(JSON.stringify(payload));
}
function nextWormRef(prev, scope, scopeId, eventPayload) {
    const prevHash = prev?.thisHash;
    const index = (prev?.index ?? 0) + 1;
    const thisHash = computeEventHash({ scope, scopeId, prevHash, index, eventPayload });
    return { scope, scopeId, prevHash, thisHash, index };
}
//# sourceMappingURL=evidenceWorm.js.map