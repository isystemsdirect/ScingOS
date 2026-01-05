export type IntentRisk = "low" | "medium" | "high";

export type IntentScope = "engine" | "registry" | "policy" | "ui" | "infra";

export interface BFIIntent {
  id: string;
  createdAt: string;
  author: string;

  description: string;
  scope: IntentScope;
  risk: IntentRisk;

  expectedOutcome: string;
  rollbackPlan: string;

  status: "declared" | "simulated" | "approved" | "executed" | "rejected";
}
