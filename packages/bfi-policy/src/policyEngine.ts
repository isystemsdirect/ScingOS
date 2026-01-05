import type { BFIIntent } from "@scingular/bfi-intent";

export type PolicyDecision = {
  decision: "allow" | "warn" | "deny";
  reason: string;
  requiredConfirmations?: number;
};

export type Actor = {
  id: string;
  role: "owner" | "dev" | "viewer";
  env: "dev" | "stage" | "prod";
};

export type SystemState = {
  nodeEnv: string;
};

export function evaluatePolicy(input: {
  intent: BFIIntent;
  actor: Actor;
  system: SystemState;
}): PolicyDecision {
  const { intent, actor } = input;

  if (actor.role === "viewer") {
    return { decision: "deny", reason: "Viewer role cannot approve or execute intents." };
  }

  if (actor.env === "prod") {
    return { decision: "deny", reason: "Production environment defaults to DENY." };
  }

  if (intent.risk === "high") {
    return {
      decision: "warn",
      reason: "High-risk intents require explicit confirmation.",
      requiredConfirmations: 1,
    };
  }

  if (intent.risk === "medium") {
    return { decision: "warn", reason: "Medium risk intent allowed with warning." };
  }

  return { decision: "allow", reason: "Low-risk intent allowed." };
}
