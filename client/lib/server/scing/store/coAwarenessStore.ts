import type { CoAwarenessState } from "../../../shared/scing/coAwareness";
import type { DelegationScope, Risk } from "../../../shared/scing/delegation";

export type AuditEvent = {
  ts: string;
  type: string;
  actor?: string;
  [k: string]: unknown;
};

const DEFAULT_SCOPE: DelegationScope = {
  blockedPaths: [".github/**", "**/.env*", "**/secrets/**", "**/keys/**"],
  allowedPaths: [],
  canTouchAuthSecrets: false,
  maxAutoRisk: "low" satisfies Risk,
  requiresApprovalAbove: "low" satisfies Risk,
};

const DEFAULT_STATE: CoAwarenessState = {
  phase: "pre_imprint",
  delegation: {
    mode: "assisted",
    scope: DEFAULT_SCOPE,
    bestOutcomeDefaults: false,
  },
};

const stateByPartner = new Map<string, CoAwarenessState>();
const auditByPartner = new Map<string, AuditEvent[]>();

export function getState(iuPartnerId: string): CoAwarenessState {
  return stateByPartner.get(iuPartnerId) ?? DEFAULT_STATE;
}

export function setState(iuPartnerId: string, next: CoAwarenessState): void {
  stateByPartner.set(iuPartnerId, next);
}

export function appendAudit(iuPartnerId: string, event: Omit<AuditEvent, "ts"> & { ts?: string }): void {
  const list = auditByPartner.get(iuPartnerId) ?? [];
  const full: AuditEvent = {
    ts: event.ts ?? new Date().toISOString(),
    type: String((event as any).type),
    actor: typeof (event as any).actor === "string" ? (event as any).actor : undefined,
    ...event,
  };
  list.push(full);
  auditByPartner.set(iuPartnerId, list);
}

export function getAudit(iuPartnerId: string): AuditEvent[] {
  return auditByPartner.get(iuPartnerId) ?? [];
}
