import type { ActionPlan } from "../../../shared/scing/actionPlan";
import type { CoAwarenessState } from "../../../shared/scing/coAwareness";
import type { DelegationScope, Risk } from "../../../shared/scing/delegation";

export function proposeActionPlan(params: {
  iuPartnerId: string;
  state: CoAwarenessState;
  scope: DelegationScope;
  intentId?: string;
  description: string;
  simulation?: {
    affectedFiles?: string[];
    affectedEngines?: string[];
    confidenceScore?: number;
  };
  estimatedRisk: Risk;
}): { plan: ActionPlan; alternatives: ActionPlan[] } {
  const plan: ActionPlan = {
    id: `plan_${Date.now()}`,
    kind: "run_task",
    description: params.description,
    risk: params.estimatedRisk,
    predictedImpact: {
      affectedFiles: params.simulation?.affectedFiles ?? [],
      affectedEngines: params.simulation?.affectedEngines ?? [],
      confidenceScore: params.simulation?.confidenceScore ?? 0.75,
    },
    rollback: { strategy: "manual" },
    decisionWhy: "server:proposeActionPlan (stub)",
  };

  return { plan, alternatives: [] };
}
