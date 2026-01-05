"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investorPack = investorPack;
const capabilityMatrix_1 = require("../lari/readiness/capabilityMatrix");
const systemClaims_1 = require("../compliance/systemClaims");
function investorPack() {
    return {
        snapshotAt: new Date().toISOString(),
        moat: [
            'Evidence-linked AI outputs',
            'WORM audit trail',
            'Domain-pack driven intelligence',
            'Deterministic risk normalization',
        ],
        capabilityMatrix: capabilityMatrix_1.LARI_CAPABILITY_MATRIX,
        claims: systemClaims_1.SYSTEM_CLAIMS,
        scaleNotes: [
            'Domains add linearly',
            'Sensors activate incrementally',
            'AI cost bounded by governance',
        ],
    };
}
//# sourceMappingURL=investorPack.js.map