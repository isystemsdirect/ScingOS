import type { DelegationScope } from "./delegation";

export const DEFAULT_DELEGATION_SCOPE = Object.freeze({
  canRunDevTasks: true,
  canStartStopServices: true,
  canManageDeps: true,
  canCreatePRs: true,

  canEditCode: true,
  canApplyPatches: true,
  canRefactor: false,
  canTouchSecurityPolicy: false,
  canTouchAuthSecrets: false,

  allowedPaths: ["client/**", "tools/**", "docs/**"],
  blockedPaths: ["**/.env*", "**/keys/**", "**/secrets/**", ".github/**"],

  maxAutoRisk: "low",
  requiresApprovalAbove: "low",
} as const satisfies DelegationScope);
