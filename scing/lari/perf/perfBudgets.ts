export const PERF_BUDGETS = {
  // non-AI deterministic phases
  prismGraphBuildMs: 50,
  doseComputeMs: 25,
  echoRunMs: 25,
  validationMs: 10,

  // AI-assisted (soft caps; used as warning or gated in staging)
  visionAnalyzeMs: 2000,
  prismReasonMs: 2500,
} as const;

export const COST_BUDGETS = {
  maxInspectionUsd: 25,
  maxOrgDailyUsd: 500,
} as const;
