import { runRegression } from '../runRegression';

test('evidence-less findings are fatal in regression', () => {
  const output: any = {
    engineId: 'LARI-ECHO',
    inspectionId: 'I',
    producedAt: '2026-01-03T00:00:00.000Z',
    findings: [
      {
        findingId: 'f1',
        title: 'Claim without evidence',
        description: 'No refs',
        evidence: [],
        confidence: { confidenceScore: 0.9, uncertaintyScore: 0.1, uncertaintyDrivers: [] },
      },
    ],
    assumptions: [],
    limitations: [],
    schemaVersion: '1.0.0',
  };

  const expected: any = { findings: [{ severity: 'minor' }] };

  expect(() => runRegression(output, expected)).toThrow();
});
