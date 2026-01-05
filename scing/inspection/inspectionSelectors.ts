import type { InspectionRecord } from './inspectionTypes';
import type { ArtifactRecord, FindingRecord, ClassificationRecord } from '../evidence';

export function sortByCreatedAt<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
}

export function selectSummary(params: {
  inspection: InspectionRecord;
  artifacts: ArtifactRecord[];
  findings: FindingRecord[];
  classifications: ClassificationRecord[];
}) {
  const artifacts = sortByCreatedAt(params.artifacts);
  const findings = sortByCreatedAt(params.findings);
  const severities = Array.from(new Set(findings.map((f) => f.severity)));
  return {
    inspectionId: params.inspection.inspectionId,
    status: params.inspection.status,
    artifactCount: artifacts.length,
    findingCount: findings.length,
    classificationCount: params.classifications.length,
    severities,
    lastArtifactAt: artifacts[artifacts.length - 1]?.createdAt ?? null,
  };
}
