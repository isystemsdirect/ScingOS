import crypto from "node:crypto";

import type { ActionPlan } from "../../../shared/scing/actionPlan";
import type { CoAwarenessState } from "../../../shared/scing/coAwareness";
import type { DelegationScope, Risk } from "../../../shared/scing/delegation";
import { chooseBestOutcome, type OutcomeOption } from "../bestOutcomePolicy";
import { enforceDelegation } from "../delegation/enforceDelegation";

function inferRisk(kind: ActionPlan["kind"], fallback: Risk): Risk {
  if (kind === "run_task") return "low";
  if (kind === "open_pr") return "low";
  if (kind === "apply_patch") return fallback;
  return fallback;
}

export function proposeActionPlan(args: {
  iuPartnerId: string;
  state: CoAwarenessState;
  scope: DelegationScope;
  intentId?: string;
  description: string;
  simulation: { affectedFiles: string[]; affectedEngines: string[]; confidenceScore: number };
  estimatedRisk: Risk;
}) {
  const options: OutcomeOption[] = [
    {
      id: "run_task",
      description: "Run type-check + build to validate readiness.",
      expectedBenefit: 0.85,
      expectedCost: 0.15,
      risk: "low",
      reversibility: 1.0,
      complianceOk: true,
    },
    {
      id: "apply_patch",
      description: "Apply safe patch set (proposal-only until patch generator is enabled).",
      expectedBenefit: 0.7,
      expectedCost: 0.35,
      risk: args.estimatedRisk,
      reversibility: 0.85,
      complianceOk: true,
    },
    {
      id: "open_pr",
      description: "Prepare PR-ready branch/commit/push (proposal-only).",
      expectedBenefit: 0.65,
      expectedCost: 0.25,
      risk: "low",
      reversibility: 0.9,
      complianceOk: true,
    },
  ];

  const best = args.state.delegation.bestOutcomeDefaults
    ? chooseBestOutcome(options, {
        maxRisk: args.scope.maxAutoRisk,
        mustBeReversibleMin: 0.8,
        requireCompliance: true,
      })
    : null;

  const selected = best ?? options[0];
  const kind = selected.id as ActionPlan["kind"];

  const plan: ActionPlan = {
    id: `ap-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    iuPartnerId: args.iuPartnerId,
    createdAt: new Date().toISOString(),
    intentId: args.intentId,
    kind,
    description: args.description || selected.description,
    risk: inferRisk(kind, args.estimatedRisk),
    predictedImpact: {
      affectedFiles: args.simulation.affectedFiles,
      affectedEngines: args.simulation.affectedEngines,
      confidenceScore: args.simulation.confidenceScore,
    },
    rollback:
      kind === "run_task"
        ? { strategy: "none" }
        : kind === "apply_patch"
          ? { strategy: "patch_revert" }
          : { strategy: "git_revert" },
    decision: "requires_approval",
    decisionWhy: "Pending enforcement gate.",
  };

  const enforced = enforceDelegation(args.state, args.scope, plan, {
    pathsTouched: args.simulation.affectedFiles,
  });

  plan.decision = enforced.decision;
  plan.decisionWhy = enforced.reason;

  return { plan, alternatives: options };
}
