"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regulatoryDisclosure = regulatoryDisclosure;
const systemClaims_1 = require("./systemClaims");
const capabilityMatrix_1 = require("../lari/readiness/capabilityMatrix");
function regulatoryDisclosure() {
    return {
        generatedAt: new Date().toISOString(),
        systemClaims: systemClaims_1.SYSTEM_CLAIMS,
        capabilityMatrix: capabilityMatrix_1.LARI_CAPABILITY_MATRIX,
        auditability: {
            evidenceWorm: true,
            outputSchemas: true,
            regressionHarness: true,
        },
    };
}
//# sourceMappingURL=regulatoryDisclosure.js.map