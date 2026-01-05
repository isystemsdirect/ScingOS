import { buildPrismGraph } from '../../../scing/lari/prism/buildPrismGraph';

test('prism graph deterministic shape', () => {
  const params: any = {
    artifacts: [
      {
        artifactId: 'a1',
        type: 'photo',
        source: 'unknown',
        tags: ['t'],
        provenance: { engineId: 'X', capturedAt: '2026-01-03T00:00:00.000Z' },
        integrity: { contentHash: 'h', hashAlg: 'sha256', integrityState: 'pending' },
      },
    ],
    findings: [
      {
        findingId: 'f1',
        title: 'T',
        severity: 'minor',
        confidence: 0.8,
        engineId: 'X',
        createdAt: '2026-01-03T00:00:00.000Z',
        relatedArtifactIds: ['a1'],
        codeRefs: [],
      },
    ],
    classifications: [],
  };

  const a = buildPrismGraph(params);
  const b = buildPrismGraph(params);

  expect(a.nodes.length).toBe(b.nodes.length);
  expect(a.edges.length).toBe(b.edges.length);
  expect(a.graphHash).toBe(b.graphHash);
});
