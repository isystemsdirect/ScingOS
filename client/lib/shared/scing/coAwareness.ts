import type { DelegationScope } from "./delegation";

export type CoAwarenessPhase = "pre_imprint" | "imprinting" | "co_aware" | "suspended";

export type DelegationMode = "manual" | "assisted" | "delegated";

export type CoAwarenessState = {
  phase: CoAwarenessPhase;
  partnerId: string | null;

  imprintReadiness: {
    score: number;
    samples: number;
    gates: {
      minSamplesMet: boolean;
      minScoreMet: boolean;
    };
  };

  delegation: {
    mode: DelegationMode;
    scope: DelegationScope;
    bestOutcomeDefaults: boolean;
  };

  declaredAt: string;
  transitionedAt?: string;
};
