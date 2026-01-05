"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReadiness = runReadiness;
const capabilityMatrix_1 = require("./capabilityMatrix");
function runReadiness(checkedAtIso) {
    const failures = [];
    if (!capabilityMatrix_1.LARI_CAPABILITY_MATRIX.aiGovernance)
        failures.push('AI_GOVERNANCE_MISSING');
    if (!capabilityMatrix_1.LARI_CAPABILITY_MATRIX.regressionHarness)
        failures.push('REGRESSION_HARNESS_MISSING');
    Object.entries(capabilityMatrix_1.LARI_CAPABILITY_MATRIX.engines).forEach(([k, v]) => {
        if (!v)
            failures.push(`ENGINE_DISABLED:${k}`);
    });
    return {
        ready: failures.length === 0,
        failures,
        matrix: capabilityMatrix_1.LARI_CAPABILITY_MATRIX,
        checkedAt: checkedAtIso ?? new Date().toISOString(),
    };
}
//# sourceMappingURL=runReadiness.js.map