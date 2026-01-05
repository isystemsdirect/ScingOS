import type { BfiAction } from "./pipelineTypes";
import type { Intent, SimulationResult } from "@scingular/sdk";

export function simulate(intent: Intent, action: BfiAction): SimulationResult {
  // Phase 1 stub: deterministic + explainable simulation.
  const notes: string[] = [];
  const affectedFiles: string[] = [];
  const affectedEngines: string[] = [];
  const affectedPolicies: string[] = [];

  if (action.kind === "tasks.run") {
    notes.push(`Will run allowlisted task: ${action.task}`);
    affectedFiles.push("client/**");
  } else if (action.kind === "registry.upsert") {
    notes.push("Will update engine registry (repo root)");
    affectedFiles.push("scingular.engine-registry.json");
    affectedEngines.push(action.engine.id);
    affectedPolicies.push("registry-coherence");
  }

  // Risk heuristic (Phase 1): map intent risk to verdict/confidence.
  let verdict: SimulationResult["verdict"] = "safe";
  let confidence = 0.72;

  if (intent.riskLevel === "high") {
    verdict = "risky";
    confidence = 0.55;
  } else if (intent.riskLevel === "medium") {
    verdict = "risky";
    confidence = 0.65;
  }

  // Hard block: if rollback is empty (schema prevents) or dangerous scope in prod handled by policy.
  if (intent.scope === "policy" && intent.riskLevel === "high") {
    notes.push("Policy + high risk flagged for additional review.");
  }

  return {
    verdict,
    confidence,
    affectedFiles,
    affectedEngines,
    affectedPolicies,
    notes,
  };
}
