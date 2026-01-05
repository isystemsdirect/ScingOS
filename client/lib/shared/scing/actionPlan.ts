import type { Risk } from "./delegation";

export type ActionKind =
  | "run_task"
  | "apply_patch"
  | "refactor"
  | "dependency_change"
  | "open_pr"
  | "config_change";

export type ActionPlan = {
  id: string;
  iuPartnerId: string;
  createdAt: string;

  intentId?: string;
  kind: ActionKind;

  description: string;
  risk: Risk;

  predictedImpact: {
    affectedFiles: string[];
    affectedEngines: string[];
    confidenceScore: number;
  };

  rollback: { strategy: "git_revert" | "patch_revert" | "none"; notes?: string };

  decision: "auto_execute" | "requires_approval" | "denied";
  decisionWhy: string;
};
