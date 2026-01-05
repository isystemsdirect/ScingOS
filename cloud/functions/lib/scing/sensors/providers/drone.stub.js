"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DroneStubProvider = void 0;
class DroneStubProvider {
    info() {
        return {
            providerId: 'drone_stub',
            type: 'drone',
            status: 'stub',
            notes: 'Drone provider stub — no real drone data captured',
        };
    }
    async capture() {
        return {
            captureId: `dr_${Date.now()}`,
            providerId: 'drone_stub',
            capturedAt: new Date().toISOString(),
            rawArtifactId: 'drone_stub_artifact',
        };
    }
}
exports.DroneStubProvider = DroneStubProvider;
//# sourceMappingURL=drone.stub.js.map