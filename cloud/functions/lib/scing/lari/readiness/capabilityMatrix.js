"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LARI_CAPABILITY_MATRIX = void 0;
exports.LARI_CAPABILITY_MATRIX = {
    engines: {
        prism: true,
        vision: true,
        echo: true,
        dose: true,
        critic: true,
    },
    domains: {
        moisture_mold: 'v1.0.0',
        roofing: 'v1.0.0',
        electrical: 'v1.0.0',
        plumbing: 'v1.0.0',
    },
    sensors: {
        thermal: 'stub',
        lidar: 'stub',
        gpr: 'stub',
        drone: 'stub',
    },
    aiGovernance: true,
    evidenceWorm: true,
    auditTrail: true,
    regressionHarness: true,
};
//# sourceMappingURL=capabilityMatrix.js.map