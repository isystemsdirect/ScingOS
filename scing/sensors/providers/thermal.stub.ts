import type { SensorProvider, SensorProviderInfo, SensorCapture } from '../providerTypes';

export class ThermalStubProvider implements SensorProvider {
  info(): SensorProviderInfo {
    return {
      providerId: 'thermal_stub',
      type: 'thermal',
      status: 'stub',
      notes: 'Thermal provider stub — no real thermal data captured',
    };
  }

  async capture(): Promise<SensorCapture> {
    return {
      captureId: `th_${Date.now()}`,
      providerId: 'thermal_stub',
      capturedAt: new Date().toISOString(),
      rawArtifactId: 'thermal_stub_artifact',
    };
  }
}
