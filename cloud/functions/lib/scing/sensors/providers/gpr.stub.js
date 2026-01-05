"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GprStubProvider = void 0;
class GprStubProvider {
    info() {
        return {
            providerId: 'gpr_stub',
            type: 'gpr',
            status: 'stub',
            notes: 'GPR provider stub — no real GPR data captured',
        };
    }
    async capture() {
        return {
            captureId: `gp_${Date.now()}`,
            providerId: 'gpr_stub',
            capturedAt: new Date().toISOString(),
            rawArtifactId: 'gpr_stub_artifact',
        };
    }
}
exports.GprStubProvider = GprStubProvider;
//# sourceMappingURL=gpr.stub.js.map