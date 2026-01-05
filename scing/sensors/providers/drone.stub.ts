import type { SensorProvider, SensorProviderInfo, SensorCapture } from '../providerTypes';

export class DroneStubProvider implements SensorProvider {
  info(): SensorProviderInfo {
    return {
      providerId: 'drone_stub',
      type: 'drone',
      status: 'stub',
      notes: 'Drone provider stub — no real drone data captured',
    };
  }

  async capture(): Promise<SensorCapture> {
    return {
      captureId: `dr_${Date.now()}`,
      providerId: 'drone_stub',
      capturedAt: new Date().toISOString(),
      rawArtifactId: 'drone_stub_artifact',
    };
  }
}
