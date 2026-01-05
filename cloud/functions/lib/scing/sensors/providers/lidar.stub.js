"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LidarStubProvider = void 0;
class LidarStubProvider {
    info() {
        return {
            providerId: 'lidar_stub',
            type: 'lidar',
            status: 'stub',
            notes: 'LiDAR provider stub — no real LiDAR data captured',
        };
    }
    async capture() {
        return {
            captureId: `li_${Date.now()}`,
            providerId: 'lidar_stub',
            capturedAt: new Date().toISOString(),
            rawArtifactId: 'lidar_stub_artifact',
        };
    }
}
exports.LidarStubProvider = LidarStubProvider;
//# sourceMappingURL=lidar.stub.js.map