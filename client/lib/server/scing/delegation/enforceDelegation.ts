import * as path from "node:path";
import type { ActionPlan } from "../../../shared/scing/actionPlan";
import type { CoAwarenessState } from "../../../shared/scing/coAwareness";
import type { DelegationScope, Risk } from "../../../shared/scing/delegation";
import { riskLeq } from "../bestOutcomePolicy";

export type DelegationDecision = {
  decision: "auto_execute" | "requires_approval" | "denied";
  reason: string;
};

function normalizePath(p: string) {
  return p.replace(/\\/g, "/");
}

function matchesPrefixGlob(file: string, pattern: string) {
  // Minimal glob support for patterns like "client/**".
  const f = normalizePath(file);
  const pat = normalizePath(pattern);

  if (pat.endsWith("/**")) {
    const prefix = pat.slice(0, -3);
    return f === prefix || f.startsWith(prefix + "/");
  }

  return f === pat;
}

function matchesBlocked(file: string, pattern: string) {
  const f = normalizePath(file);
  const pat = normalizePath(pattern);

  // Handle simple prefix globs first.
  if (matchesPrefixGlob(f, pat)) return true;

  // Handle common security patterns in DEFAULT_DELEGATION_SCOPE.
  if (pat.includes(".github")) return f.startsWith(".github/") || f.includes("/.github/");
  if (pat.includes("/keys/")) return f.includes("/keys/");
  if (pat.includes("/secrets/")) return f.includes("/secrets/");
  if (pat.includes(".env")) {
    const base = path.posix.basename(f);
    return base.startsWith(".env");
  }

  return false;
}

function riskGt(a: Risk, b: Risk) {
  return !riskLeq(a, b);
}

export function enforceDelegation(
  state: CoAwarenessState,
  scope: DelegationScope,
  plan: ActionPlan,
  meta?: { pathsTouched?: string[]; minConfidence?: number }
): DelegationDecision {
  const minConfidence = meta?.minConfidence ?? 0.7;
  const pathsTouched =
    plan.kind === "run_task"
      ? []
      : meta?.pathsTouched ?? plan.predictedImpact?.affectedFiles ?? [];

  if (state.phase !== "co_aware") {
    return { decision: "requires_approval", reason: "Phase is not co_aware; autonomous execution is disabled." };
  }

  if (state.delegation.mode !== "delegated") {
    return { decision: "requires_approval", reason: "Delegation mode is not delegated." };
  }

  if (scope.canTouchAuthSecrets === false) {
    // Hard deny any plan that even hints at secrets/auth material.
    const desc = plan.description.toLowerCase();
    if (desc.includes("secret") || desc.includes("token") || desc.includes("key") || desc.includes("auth")) {
      return { decision: "denied", reason: "Touching secrets/auth is always denied." };
    }
  }

  for (const f of pathsTouched) {
    if (scope.blockedPaths.some((p) => matchesBlocked(f, p))) {
      return { decision: "denied", reason: `Plan touches blocked path: ${f}` };
    }

    if (scope.allowedPaths.length && !scope.allowedPaths.some((p) => matchesPrefixGlob(f, p))) {
      return { decision: "requires_approval", reason: `Plan touches non-allowed path: ${f}` };
    }
  }

  if (riskGt(plan.risk, scope.maxAutoRisk)) {
    return { decision: "requires_approval", reason: `Risk ${plan.risk} exceeds maxAutoRisk ${scope.maxAutoRisk}.` };
  }

  if (riskGt(plan.risk, scope.requiresApprovalAbove)) {
    return {
      decision: "requires_approval",
      reason: `Risk ${plan.risk} exceeds requiresApprovalAbove ${scope.requiresApprovalAbove}.`,
    };
  }

  const confidence = plan.predictedImpact?.confidenceScore ?? 0;
  if (confidence < minConfidence) {
    return { decision: "requires_approval", reason: `Confidence ${confidence.toFixed(2)} is below threshold ${minConfidence.toFixed(2)}.` };
  }

  if (plan.kind !== "run_task" && plan.rollback?.strategy === "none") {
    return { decision: "requires_approval", reason: "Non-run_task action must include a rollback strategy." };
  }

  return { decision: "auto_execute", reason: "Within scope and risk cap; confidence threshold met." };
}
