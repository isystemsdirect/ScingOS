import type {
  ArtifactRecord,
  FindingRecord,
  ClassificationRecord,
} from '../../evidence/evidenceTypes';
import { sha256Hex } from '../../evidence/evidenceHash';
import { stableJsonDeep, stableSort } from '../../report/reportDeterminism';
import type { PrismEdge, PrismGraph, PrismNode } from './prismGraph.types';

function nodeId(kind: 'artifact' | 'finding' | 'classification', id: string): string {
  return `${kind}:${id}`;
}

export function buildPrismGraph(params: {
  artifacts: ArtifactRecord[];
  findings: FindingRecord[];
  classifications: ClassificationRecord[];
}): PrismGraph {
  const artifacts = stableSort(params.artifacts ?? [], (a) => a.artifactId);
  const findings = stableSort(params.findings ?? [], (f) => f.findingId);
  const classifications = stableSort(params.classifications ?? [], (c) => c.classificationId);

  const nodes: PrismNode[] = [];
  const edges: PrismEdge[] = [];

  for (const a of artifacts) {
    nodes.push({
      id: nodeId('artifact', a.artifactId),
      kind: 'artifact',
      label: a.type,
      meta: {
        artifactId: a.artifactId,
        source: a.source,
        engineId: a.provenance.engineId,
        capturedAt: a.provenance.capturedAt,
        contentHash: a.integrity.contentHash,
      },
    });
  }

  for (const f of findings) {
    nodes.push({
      id: nodeId('finding', f.findingId),
      kind: 'finding',
      label: f.title,
      meta: {
        findingId: f.findingId,
        severity: f.severity,
        confidence: f.confidence,
        engineId: f.engineId,
        createdAt: f.createdAt,
      },
    });

    const rel = stableSort(f.relatedArtifactIds ?? [], (x) => x);
    for (const artifactId of rel) {
      edges.push({
        from: nodeId('finding', f.findingId),
        to: nodeId('artifact', artifactId),
        kind: 'evidence',
      });
    }
  }

  for (const c of classifications) {
    nodes.push({
      id: nodeId('classification', c.classificationId),
      kind: 'classification',
      label: c.label,
      meta: {
        classificationId: c.classificationId,
        confidence: c.confidence,
        engineId: c.engineId,
        createdAt: c.createdAt,
      },
    });

    const rel = stableSort(c.relatedArtifactIds ?? [], (x) => x);
    for (const artifactId of rel) {
      edges.push({
        from: nodeId('classification', c.classificationId),
        to: nodeId('artifact', artifactId),
        kind: 'classifies',
      });
    }
  }

  const stable = {
    version: '1' as const,
    nodes: stableSort(nodes, (n) => `${n.kind}|${n.id}`),
    edges: stableSort(edges, (e) => `${e.kind}|${e.from}|${e.to}`),
  };

  const graphHash = sha256Hex(stableJsonDeep(stable));

  return {
    ...stable,
    graphHash,
  };
}
