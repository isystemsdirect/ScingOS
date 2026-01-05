import { LARI_CAPABILITY_MATRIX } from './capabilityMatrix';

export function runReadiness(checkedAtIso?: string) {
  const failures: string[] = [];

  if (!LARI_CAPABILITY_MATRIX.aiGovernance) failures.push('AI_GOVERNANCE_MISSING');
  if (!LARI_CAPABILITY_MATRIX.regressionHarness) failures.push('REGRESSION_HARNESS_MISSING');

  Object.entries(LARI_CAPABILITY_MATRIX.engines).forEach(([k, v]) => {
    if (!v) failures.push(`ENGINE_DISABLED:${k}`);
  });

  return {
    ready: failures.length === 0,
    failures,
    matrix: LARI_CAPABILITY_MATRIX,
    checkedAt: checkedAtIso ?? new Date().toISOString(),
  };
}
