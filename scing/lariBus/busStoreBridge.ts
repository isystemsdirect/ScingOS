import type { EngineOutput } from './busTypes';

export type StoreBridge = {
  onHUD: (payload: any) => void;
  onArtifact: (record: any) => void;
  onFinding: (record: any) => void;
  onClassification: (record: any) => void;
  onMapLayer: (record: any) => void;
  onTelemetry: (record: any) => void;
  onLog: (level: string, message: string, data?: any) => void;
};

export function routeOutput(bridge: StoreBridge, out: EngineOutput) {
  if (out.kind === 'hud') bridge.onHUD(out.payload);
  if (out.kind === 'artifactRecord') bridge.onArtifact(out.record);
  if (out.kind === 'finding') bridge.onFinding(out.record);
  if (out.kind === 'classification') bridge.onClassification(out.record);
  if (out.kind === 'mapLayer') bridge.onMapLayer(out.record);
  if (out.kind === 'telemetry') bridge.onTelemetry(out.record);
  if (out.kind === 'log') bridge.onLog(out.level, out.message, out.data);
}
