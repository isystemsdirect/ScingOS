"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermalStubProvider = void 0;
class ThermalStubProvider {
    info() {
        return {
            providerId: 'thermal_stub',
            type: 'thermal',
            status: 'stub',
            notes: 'Thermal provider stub — no real thermal data captured',
        };
    }
    async capture() {
        return {
            captureId: `th_${Date.now()}`,
            providerId: 'thermal_stub',
            capturedAt: new Date().toISOString(),
            rawArtifactId: 'thermal_stub_artifact',
        };
    }
}
exports.ThermalStubProvider = ThermalStubProvider;
//# sourceMappingURL=thermal.stub.js.map