import type { LariEngineOutput } from '../contracts/lariOutput.schema';
import type { CriticResult } from './criticTypes';

export function runCritic(o: LariEngineOutput): CriticResult[] {
  return o.findings.map((f) => {
    if (f.evidence.length === 0) {
      return {
        findingId: f.findingId,
        decision: { allow: false, reason: 'NO_EVIDENCE' },
      };
    }

    if (f.confidence.confidenceScore < 0.4) {
      return {
        findingId: f.findingId,
        decision: { allow: true },
        adjustments: {
          addWarning: 'LOW_CONFIDENCE_FINDING',
        },
      };
    }

    return { findingId: f.findingId, decision: { allow: true } };
  });
}
