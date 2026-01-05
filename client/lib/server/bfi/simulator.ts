import type { BFIIntent, IntentRisk } from "@scingular/bfi-intent";
import { buildSystemGraph } from "./graph/systemGraph";
import { mapIntentToImpact } from "./simulator/impactMapper";
import { computeConfidenceScore } from "./simulator/confidence";

export type SimulationOutput = {
  affectedFiles: string[];
  affectedEngines: string[];
  affectedPolicies?: string[];
  estimatedRisk: IntentRisk;
  confidenceScore: number; // 0-1
  explanation?: {
    graph: { fileCount: number; commit?: string };
    classificationSummary: { direct: number; indirect: number; unknown: number };
    confidenceBreakdown: { graphCoverage: number; unknownPenalty: number; historical: number };
  };
};

export async function simulateImpact(repoRoot: string, intent: BFIIntent): Promise<SimulationOutput> {
  const graph = await buildSystemGraph(repoRoot, { useCache: true });
  const impact = mapIntentToImpact(intent, graph);

  const affectedFiles = impact.affectedNodes
    .filter((id) => id.startsWith("file:"))
    .map((id) => id.replace(/^file:/, ""));

  // Ensure registry file appears when registry or engines are impacted.
  if (intent.scope === "registry" || impact.affectedEngines.length > 0) {
    if (!affectedFiles.includes("scingular.engine-registry.json")) affectedFiles.push("scingular.engine-registry.json");
  }

  const { score, breakdown } = await computeConfidenceScore(repoRoot, intent, impact);

  const summary = { direct: 0, indirect: 0, unknown: 0 };
  for (const c of Object.values(impact.classification)) {
    if (c === "direct") summary.direct += 1;
    if (c === "indirect") summary.indirect += 1;
    if (c === "unknown") summary.unknown += 1;
  }

  return {
    affectedFiles,
    affectedEngines: impact.affectedEngines,
    affectedPolicies: impact.affectedPolicies,
    estimatedRisk: intent.risk,
    confidenceScore: score,
    explanation: {
      graph: { fileCount: graph.meta.fileCount, commit: graph.meta.repoCommit },
      classificationSummary: summary,
      confidenceBreakdown: breakdown,
    },
  };
}
