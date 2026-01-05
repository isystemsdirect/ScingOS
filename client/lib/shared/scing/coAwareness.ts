import type { DelegationScope } from "./delegation";

export type CoPhase = "pre_imprint" | "imprinting" | "co_aware" | "suspended";
export type DelegationMode = "manual" | "assisted" | "delegated";

export type CoAwarenessState = {
  phase: CoPhase;
  delegation: {
    mode: DelegationMode;
    scope: DelegationScope;
    bestOutcomeDefaults?: boolean;
  };
};
