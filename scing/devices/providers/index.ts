import type { CaptureArtifact, CaptureRequest } from '../deviceTypes';

export type DeviceProvider = {
  providerId: string;
  supports: (req: CaptureRequest) => boolean;
  capture: (req: CaptureRequest) => Promise<{ artifacts: CaptureArtifact[] } | { artifacts: CaptureArtifact[] }>;
};
