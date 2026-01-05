export type Risk = "low" | "medium" | "high" | "critical";

export type DelegationScope = {
  // A list of file globs or prefixes that must never be touched.
  blockedPaths: string[];

  // If non-empty, a plan touching files outside these prefixes requires approval.
  allowedPaths: string[];

  // If false, anything involving secrets/auth is denied.
  canTouchAuthSecrets: boolean;

  // Highest risk allowed to auto-execute.
  maxAutoRisk: Risk;

  // Above this risk, always require approval (even if within maxAutoRisk).
  requiresApprovalAbove: Risk;
};
