import type { SensorProvider, SensorProviderInfo, SensorCapture } from '../providerTypes';

export class GprStubProvider implements SensorProvider {
  info(): SensorProviderInfo {
    return {
      providerId: 'gpr_stub',
      type: 'gpr',
      status: 'stub',
      notes: 'GPR provider stub — no real GPR data captured',
    };
  }

  async capture(): Promise<SensorCapture> {
    return {
      captureId: `gp_${Date.now()}`,
      providerId: 'gpr_stub',
      capturedAt: new Date().toISOString(),
      rawArtifactId: 'gpr_stub_artifact',
    };
  }
}
