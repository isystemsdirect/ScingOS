import type { Risk } from "./delegation";

export type PredictedImpact = {
  affectedFiles?: string[];
  affectedEngines?: string[];
  confidenceScore?: number; // 0..1
};

export type Rollback = {
  strategy: "none" | "manual" | "auto";
};

export type ActionPlan = {
  id?: string;
  kind: "run_task" | "edit_files" | "proposal";
  description: string;
  risk: Risk;
  predictedImpact?: PredictedImpact;
  rollback?: Rollback;
  decisionWhy?: string;
};
