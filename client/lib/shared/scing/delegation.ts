export type Risk = "low" | "medium" | "high" | "critical";

export type DelegationScope = {
  // operational tasks
  canRunDevTasks: boolean;
  canStartStopServices: boolean;
  canManageDeps: boolean;
  canCreatePRs: boolean;

  // code modification authority (bounded)
  canEditCode: boolean;
  canApplyPatches: boolean;
  canRefactor: boolean;
  canTouchSecurityPolicy: boolean;
  canTouchAuthSecrets: boolean;

  // environment boundaries
  allowedPaths: string[];
  blockedPaths: string[];

  // risk gates
  maxAutoRisk: Risk;
  requiresApprovalAbove: Risk;
};
