export type SensorStatus = 'active' | 'stub' | 'disabled';

export type SensorProviderInfo = {
  providerId: string;
  type: 'thermal' | 'lidar' | 'gpr' | 'drone';
  status: SensorStatus;
  manufacturer?: string;
  model?: string;
  firmware?: string;
  calibratedAt?: string;
  notes?: string;
};

export type SensorCapture = {
  captureId: string;
  providerId: string;
  capturedAt: string;
  rawArtifactId: string;
  derivedArtifacts?: string[];
  measurements?: {
    name: string;
    value: number;
    unit: string;
  }[];
};

export interface SensorProvider {
  info(): SensorProviderInfo;
  capture(): Promise<SensorCapture>;
}
