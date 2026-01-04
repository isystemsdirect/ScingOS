import { validateLariOutput } from '../../scing/lari/contracts/validateLariOutput';

export function runRegression(actual: any, expected: any) {
  const v = validateLariOutput(actual);
  if (!v.ok) throw new Error('SCHEMA_INVALID');

  expected.findings.forEach((e: any) => {
    const match = actual.findings.find((f: any) => f.severity === e.severity);
    if (!match) throw new Error('EXPECTED_FINDING_MISSING');
    if (!match.evidence || match.evidence.length === 0) throw new Error('EVIDENCE_MISSING');
  });
}
