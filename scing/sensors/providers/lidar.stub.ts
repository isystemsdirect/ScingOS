import type { SensorProvider, SensorProviderInfo, SensorCapture } from '../providerTypes';

export class LidarStubProvider implements SensorProvider {
  info(): SensorProviderInfo {
    return {
      providerId: 'lidar_stub',
      type: 'lidar',
      status: 'stub',
      notes: 'LiDAR provider stub — no real LiDAR data captured',
    };
  }

  async capture(): Promise<SensorCapture> {
    return {
      captureId: `li_${Date.now()}`,
      providerId: 'lidar_stub',
      capturedAt: new Date().toISOString(),
      rawArtifactId: 'lidar_stub_artifact',
    };
  }
}
