import { PERF_BUDGETS } from '../../../scing/lari/perf/perfBudgets';
import { buildPrismGraph } from '../../../scing/lari/prism/buildPrismGraph';
import { computeDose } from '../../../scing/lari/dose/computeDose';
import { runEcho } from '../../../scing/lari/echo/runEcho';

function now() {
  return Date.now();
}

test('prism graph build within budget', () => {
  const t0 = now();

  buildPrismGraph({
    artifacts: [
      {
        artifactId: 'a1',
        type: 'photo',
        source: 'unknown',
        tags: [],
        provenance: { engineId: 'X', capturedAt: '2026-01-03T00:00:00.000Z' },
        integrity: { contentHash: 'h', hashAlg: 'sha256', integrityState: 'pending' },
      } as any,
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
      } as any,
    ],
    classifications: [],
  });

  const dt = now() - t0;
  expect(dt).toBeLessThanOrEqual(PERF_BUDGETS.prismGraphBuildMs);
});

test('dose compute within budget', () => {
  const t0 = now();

  computeDose({
    domainKey: 'roofing',
    findings: [
      {
        findingId: 'f1',
        title: 'Active leak indicators',
        description: 'Observed stain',
        severity: 'critical',
        evidence: [{ kind: 'artifact', refId: 'a1' }],
        confidence: { confidenceScore: 0.9, uncertaintyScore: 0.1, uncertaintyDrivers: [] },
      } as any,
    ],
  });

  const dt = now() - t0;
  expect(dt).toBeLessThanOrEqual(PERF_BUDGETS.doseComputeMs);
});

test('echo run within budget', () => {
  const t0 = now();

  runEcho({
    domainKey: 'moisture_mold',
    input: {
      engineId: 'LARI-ECHO',
      inspectionId: 'I',
      receivedAt: '2026-01-03T00:00:00.000Z',
      artifacts: [],
      measurements: [
        {
          measurementId: 'm1',
          name: 'moisture_pct',
          kind: 'percent',
          observedAt: '2026-01-03T00:00:00.000Z',
          value: { value: 25, unit: 'pct' },
          evidence: [{ kind: 'measurement', refId: 'm1' }],
        } as any,
      ],
      fieldInputs: [],
      schemaVersion: '1.0.0',
    } as any,
  });

  const dt = now() - t0;
  expect(dt).toBeLessThanOrEqual(PERF_BUDGETS.echoRunMs);
});
