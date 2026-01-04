import type { LariEngineOutput } from './lariOutput.schema';

export function validateLariOutput(
  o: LariEngineOutput
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (!o.engineId) errors.push('MISSING_ENGINE_ID');
  if (!o.inspectionId) errors.push('MISSING_INSPECTION_ID');
  if (!Array.isArray(o.findings)) errors.push('FINDINGS_NOT_ARRAY');

  o.findings?.forEach((f, i) => {
    if (!f.evidence || f.evidence.length === 0) {
      errors.push(`FINDING_${i}_NO_EVIDENCE`);
    }
    if (f.confidence.confidenceScore < 0 || f.confidence.confidenceScore > 1) {
      errors.push(`FINDING_${i}_INVALID_CONFIDENCE`);
    }
  });

  return errors.length ? { ok: false, errors } : { ok: true };
}
