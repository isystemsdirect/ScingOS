import type { BFIIntent } from "@scingular/bfi-intent";
import type { ImpactMapOutput } from "./impactMapper";
import { getMemoryStatsForIntent } from "../memory/patterns";

export type ConfidenceBreakdown = {
  graphCoverage: number;
  unknownPenalty: number;
  historical: number;
};

export async function computeConfidenceScore(repoRoot: string, intent: BFIIntent, impact: ImpactMapOutput): Promise<{ score: number; breakdown: ConfidenceBreakdown }> {
  const total = Math.max(1, impact.affectedNodes.length);
  const unknown = impact.unknownDependencies.length;

  const graphCoverage = Math.max(0, Math.min(1, 1 - unknown / (total + unknown)));
  const unknownPenalty = Math.max(0, Math.min(0.4, unknown / 25));

  const stats = await getMemoryStatsForIntent(repoRoot, intent);
  const historical = stats ? stats.expectedSuccessRate : 0.6;

  // Weighted blend tuned for v1 explainability.
  let score = 0.15 + 0.55 * graphCoverage + 0.35 * historical - unknownPenalty;

  // Risk sensitivity.
  if (intent.risk === "high") score -= 0.15;
  if (intent.risk === "medium") score -= 0.05;

  score = Math.max(0.05, Math.min(0.98, score));

  return { score, breakdown: { graphCoverage, unknownPenalty, historical } };
}
