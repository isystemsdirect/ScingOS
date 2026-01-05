import { runRegression } from '../runRegression';

test('operator notes cannot override evidence', () => {
  const output: any = {
    engineId: 'LARI-VISION',
    inspectionId: 'I',
    producedAt: '2026-01-03T00:00:00.000Z',
    findings: [
      {
        findingId: 'f1',
        title: 'Injected claim',
        description: 'Trust me',
        evidence: [],
        confidence: { confidenceScore: 0.9, uncertaintyScore: 0.1, uncertaintyDrivers: [] },
      },
    ],
    assumptions: [],
    limitations: [],
    schemaVersion: '1.0.0',
  };

  const expected: any = {
    findings: [{ severity: undefined }],
  };

  expect(() => runRegression(output, expected)).toThrow('SCHEMA_INVALID');
});
