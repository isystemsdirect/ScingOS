import type { InspectionRecord } from '../inspection/inspectionTypes';
import type {
  ArtifactRecord,
  FindingRecord,
  ClassificationRecord,
  MapLayerRecord,
} from '../evidence';
import { sha256Hex } from '../evidence/evidenceHash';
import { DEFAULT_SECTIONS, SECTION_TITLES } from './templates/defaultTemplate';
import { stableJsonDeep, stableSort, stableSeverityRank } from './reportDeterminism';

export type ReportBlock = { section: string; title: string; content: unknown };

export type ComposedReport = {
  reportId: string;
  orgId: string;
  inspectionId: string;
  generatedAt: string;
  version: '1';
  sections: ReportBlock[];
  evidenceRefs: string[]; // artifactIds
};

function deterministicReportId(params: {
  inspection: InspectionRecord;
  artifacts: ArtifactRecord[];
  findings: FindingRecord[];
  classifications: ClassificationRecord[];
  mapLayers: MapLayerRecord[];
}): string {
  // Canon: report output must be deterministic for the same state.
  const payload = {
    inspection: {
      inspectionId: params.inspection.inspectionId,
      orgId: params.inspection.orgId,
      title: params.inspection.title,
      description: params.inspection.description ?? null,
      status: params.inspection.status,
      createdAt: params.inspection.createdAt,
      updatedAt: params.inspection.updatedAt,
      finalizedAt: params.inspection.finalizedAt ?? null,
      requiredArtifactTypes: params.inspection.requiredArtifactTypes,
      requiredMinimumArtifacts: params.inspection.requiredMinimumArtifacts,
      location: params.inspection.location ?? null,
      addressText: params.inspection.addressText ?? null,
    },
    artifacts: stableSort(params.artifacts, (a) => `${a.createdAt}|${a.artifactId}`).map((a) => ({
      artifactId: a.artifactId,
      createdAt: a.createdAt,
      type: a.type,
      source: a.source,
      contentHash: a.integrity.contentHash,
      integrityState: a.integrity.integrityState,
      finalized: a.finalized,
      tags: a.tags,
      capturedAt: a.provenance.capturedAt,
      engineId: a.provenance.engineId,
    })),
    findings: [...params.findings]
      .sort((a, b) => {
        const ra = stableSeverityRank(a.severity);
        const rb = stableSeverityRank(b.severity);
        if (ra !== rb) return ra - rb;
        const ka = `${a.createdAt}|${a.findingId}`;
        const kb = `${b.createdAt}|${b.findingId}`;
        return ka < kb ? -1 : ka > kb ? 1 : 0;
      })
      .map((f) => ({
        findingId: f.findingId,
        createdAt: f.createdAt,
        engineId: f.engineId,
        title: f.title,
        severity: f.severity,
        confidence: f.confidence,
        rationale: f.rationale ?? null,
        relatedArtifactIds: [...f.relatedArtifactIds].sort(),
        codeRefs: f.codeRefs,
      })),
    classifications: stableSort(params.classifications, (c) => `${c.createdAt}|${c.classificationId}`).map(
      (c) => ({
        classificationId: c.classificationId,
        createdAt: c.createdAt,
        engineId: c.engineId,
        label: c.label,
        confidence: c.confidence,
        relatedArtifactIds: [...c.relatedArtifactIds].sort(),
        metadata: c.metadata ?? null,
      })
    ),
    mapLayers: stableSort(params.mapLayers ?? [], (m) => `${m.createdAt}|${m.layerId}`).map((m) => ({
      layerId: m.layerId,
      createdAt: m.createdAt,
      engineId: m.engineId,
      name: m.name,
      kind: m.kind,
      relatedArtifactIds: [...m.relatedArtifactIds].sort(),
      storage: m.storage ?? null,
    })),
  };

  return `report_${sha256Hex(stableJsonDeep(payload))}`;
}

export function composeDeterministicReport(params: {
  inspection: InspectionRecord;
  artifacts: ArtifactRecord[];
  findings: FindingRecord[];
  classifications: ClassificationRecord[];
  mapLayers: MapLayerRecord[];
}): ComposedReport {
  const inspection = params.inspection;
  const artifacts = stableSort(params.artifacts, (a) => `${a.createdAt}|${a.artifactId}`);
  const findings = [...params.findings].sort((a, b) => {
    const ra = stableSeverityRank(a.severity);
    const rb = stableSeverityRank(b.severity);
    if (ra !== rb) return ra - rb;
    const ka = `${a.createdAt}|${a.findingId}`;
    const kb = `${b.createdAt}|${b.findingId}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  const classifications = stableSort(
    params.classifications,
    (c) => `${c.createdAt}|${c.classificationId}`
  );
  const mapLayers = stableSort(params.mapLayers ?? [], (m) => `${m.createdAt}|${m.layerId}`);

  const sections: ReportBlock[] = [];
  for (const sec of DEFAULT_SECTIONS) {
    if (sec === 'overview') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: {
          title: inspection.title,
          inspectionId: inspection.inspectionId,
          status: inspection.status,
          generatedAt: inspection.updatedAt,
          counts: {
            artifacts: artifacts.length,
            findings: findings.length,
            classifications: classifications.length,
            mapLayers: mapLayers.length,
          },
          topSeverities: Array.from(new Set(findings.map((f) => f.severity))),
        },
      });
    }
    if (sec === 'scope') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: {
          method:
            'SCINGULAR evidence-based inspection; findings are artifact-linked and chain-of-custody tracked.',
          requiredMinimumArtifacts: inspection.requiredMinimumArtifacts,
          requiredArtifactTypes: inspection.requiredArtifactTypes,
        },
      });
    }
    if (sec === 'site') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: {
          location: inspection.location ?? null,
          addressText: inspection.addressText ?? null,
          notes: inspection.description ?? null,
        },
      });
    }
    if (sec === 'evidence_summary') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: artifacts.map((a) => ({
          artifactId: a.artifactId,
          type: a.type,
          source: a.source,
          capturedAt: a.provenance.capturedAt,
          engineId: a.provenance.engineId,
          contentHash: a.integrity.contentHash,
          finalized: a.finalized,
          integrityState: a.integrity.integrityState,
          tags: a.tags,
        })),
      });
    }
    if (sec === 'findings') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: findings.map((f) => ({
          findingId: f.findingId,
          title: f.title,
          severity: f.severity,
          confidence: f.confidence,
          rationale: f.rationale ?? null,
          relatedArtifactIds: f.relatedArtifactIds,
          codeRefs: f.codeRefs,
        })),
      });
    }
    if (sec === 'classifications') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: classifications.map((c) => ({
          classificationId: c.classificationId,
          label: c.label,
          confidence: c.confidence,
          relatedArtifactIds: c.relatedArtifactIds,
          metadata: c.metadata ?? null,
        })),
      });
    }
    if (sec === 'maps') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: mapLayers.map((m) => ({
          layerId: m.layerId,
          name: m.name,
          kind: m.kind,
          relatedArtifactIds: m.relatedArtifactIds,
          storage: m.storage ?? null,
        })),
      });
    }
    if (sec === 'appendix') {
      sections.push({
        section: sec,
        title: SECTION_TITLES[sec],
        content: {
          evidenceIndex: artifacts.map((a) => ({
            artifactId: a.artifactId,
            contentHash: a.integrity.contentHash,
            wormScope: 'artifact',
            note: 'Use audit wormHeads + artifactEvents to verify custody chain at export time.',
          })),
        },
      });
    }
  }

  const reportId = deterministicReportId({
    inspection: params.inspection,
    artifacts: params.artifacts,
    findings: params.findings,
    classifications: params.classifications,
    mapLayers: params.mapLayers,
  });

  return {
    reportId,
    orgId: inspection.orgId,
    inspectionId: inspection.inspectionId,
    generatedAt: inspection.updatedAt,
    version: '1',
    sections,
    evidenceRefs: artifacts.map((a) => a.artifactId),
  };
}
