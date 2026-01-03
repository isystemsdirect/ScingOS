export type ArtifactType =
  | 'photo'
  | 'video'
  | 'audio'
  | 'document'
  | 'pointcloud'
  | 'mesh'
  | 'thermal_image'
  | 'spectral_scan'
  | 'sonar_scan'
  | 'gpr_scan'
  | 'ndt_scan'
  | 'telemetry_blob'
  | 'map_overlay'
  | 'other';

export type ArtifactSource =
  | 'builtin_camera'
  | 'external_camera'
  | 'lidar_builtin'
  | 'lidar_external'
  | 'drone'
  | 'spectrometer'
  | 'sonar'
  | 'gpr'
  | 'thermal'
  | 'ultrasonic'
  | 'acoustic_emission'
  | 'eddy_current'
  | 'gis'
  | 'weatherbot'
  | 'control'
  | 'manual_upload'
  | 'unknown';

export type IntegrityState = 'pending' | 'verified' | 'failed';

export type GeoPoint = { lat: number; lng: number; accM?: number };

export type DeviceRef = { deviceId: string; platform?: string; hardwareIdsHash?: string };

export type ActorRef = { uid: string; orgId: string; role?: string };

export type Provenance = {
  capturedAt: string;
  capturedBy: ActorRef;
  capturedOn: DeviceRef;
  location?: GeoPoint;
  addressText?: string;
  engineId: string;
  engineVersion?: string;
  sessionId?: string;
  inspectionId: string;
  jobRef?: string;
  notes?: string;
};

export type ArtifactIntegrity = {
  contentHash: string;
  hashAlg: 'sha256';
  sizeBytes?: number;
  mimeType?: string;
  signature?: {
    alg: 'EdDSA' | 'ES256' | 'RS256' | 'HS256';
    kid: string;
    sig: string;
    signedAt: string;
    signer: 'device' | 'server';
  };
  integrityState: IntegrityState;
  verifiedAt?: string;
  failureReason?: string;
};

export type ArtifactStorage = {
  bucket?: string;
  objectPath?: string;
  downloadUrl?: string;
  uploadedAt?: string;
  uploadState: 'local' | 'queued' | 'uploaded';
};

export type ArtifactRecord = {
  artifactId: string;
  orgId: string;
  inspectionId: string;
  type: ArtifactType;
  source: ArtifactSource;
  title?: string;
  description?: string;
  tags: string[];
  annotations?: any;
  provenance: Provenance;
  integrity: ArtifactIntegrity;
  storage: ArtifactStorage;
  retention: { class: 'standard' | 'extended' | 'legal_hold'; deleteAfter?: string };
  createdAt: string;
  updatedAt: string;
  finalized: boolean;
};

export type ArtifactEventType =
  | 'CAPTURED'
  | 'ANNOTATED'
  | 'HASHED'
  | 'SIGNED'
  | 'UPLOADED'
  | 'VERIFIED'
  | 'ACCESSED'
  | 'EXPORTED'
  | 'TRANSFERRED'
  | 'REDACTED'
  | 'REVOKED';

export type WormChainRef = {
  scope: 'inspection' | 'artifact' | 'org';
  scopeId: string;
  prevHash?: string;
  thisHash: string;
  index: number;
};

export type ArtifactEvent = {
  eventId: string;
  orgId: string;
  inspectionId: string;
  artifactId?: string;
  type: ArtifactEventType;
  ts: string;
  actor: ActorRef;
  device?: DeviceRef;
  engineId?: string;
  details?: any;
  worm: WormChainRef;
};

export type FindingSeverity = 'info' | 'minor' | 'major' | 'critical';

export type FindingRecord = {
  findingId: string;
  orgId: string;
  inspectionId: string;
  engineId: string;
  title: string;
  severity: FindingSeverity;
  confidence: number;
  rationale?: string;
  relatedArtifactIds: string[];
  codeRefs: Array<{ authority: string; code: string; section?: string; version?: string }>;
  createdAt: string;
  updatedAt: string;
};

export type ClassificationRecord = {
  classificationId: string;
  orgId: string;
  inspectionId: string;
  engineId: string;
  label: string;
  confidence: number;
  metadata?: any;
  relatedArtifactIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type MapLayerRecord = {
  layerId: string;
  orgId: string;
  inspectionId: string;
  engineId: string;
  kind: 'overlay' | 'tiles' | 'vector' | 'mesh_alignment' | 'heatmap';
  name: string;
  bounds?: any;
  relatedArtifactIds: string[];
  storage?: { bucket?: string; objectPath?: string; contentHash?: string };
  createdAt: string;
  updatedAt: string;
};

export type TelemetryRecord = {
  telemetryId: string;
  orgId: string;
  inspectionId: string;
  engineId: string;
  ts: string;
  payload: any;
  relatedArtifactIds?: string[];
  createdAt: string;
};
