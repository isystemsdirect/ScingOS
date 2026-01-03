import type {
  ArtifactRecord,
  ClassificationRecord,
  FindingRecord,
  MapLayerRecord,
} from './evidenceTypes';

export type InspectionIndex = {
  inspectionId: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'in_progress' | 'final' | 'archived';
  title?: string;
  location?: any;
  inspectorUid?: string;
  artifactCount: number;
  findingsCount: number;
  classificationsCount: number;
  topSeverities?: string[];
  tags?: string[];
  reportReady: boolean;
};

export function computeIndex(params: {
  inspectionId: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  status: InspectionIndex['status'];
  artifacts: ArtifactRecord[];
  findings: FindingRecord[];
  classifications: ClassificationRecord[];
  mapLayers?: MapLayerRecord[];
}): InspectionIndex {
  const severities = Array.from(new Set(params.findings.map((f) => f.severity)));
  const tags = Array.from(new Set(params.artifacts.flatMap((a) => a.tags)));
  return {
    inspectionId: params.inspectionId,
    orgId: params.orgId,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    status: params.status,
    artifactCount: params.artifacts.length,
    findingsCount: params.findings.length,
    classificationsCount: params.classifications.length,
    topSeverities: severities,
    tags,
    reportReady: params.status === 'final' && params.artifacts.every((a) => a.finalized),
  };
}
