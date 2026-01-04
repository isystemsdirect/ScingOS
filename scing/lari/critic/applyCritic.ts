import type { LariEngineOutput } from '../contracts/lariOutput.schema';
import type { CriticResult } from './criticTypes';

export function applyCritic(o: LariEngineOutput, results: CriticResult[]): LariEngineOutput {
  const allowedIds = new Set(results.filter((r) => r.decision.allow).map((r) => r.findingId));

  const updatedFindings = o.findings
    .filter((f) => allowedIds.has(f.findingId))
    .map((f) => {
      const r = results.find((x) => x.findingId === f.findingId);
      if (!r?.adjustments) return f;

      return {
        ...f,
        confidence: {
          ...f.confidence,
          confidenceScore: r.adjustments.confidenceScore ?? f.confidence.confidenceScore,
          uncertaintyScore: r.adjustments.uncertaintyScore ?? f.confidence.uncertaintyScore,
        },
      };
    });

  return {
    ...o,
    findings: updatedFindings,
    engineWarnings: results
      .filter((r) => r.adjustments?.addWarning)
      .map((r) => r.adjustments!.addWarning!),
  };
}
