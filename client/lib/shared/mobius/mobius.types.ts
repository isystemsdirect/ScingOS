export type MobiusPhase = "perceive" | "interpret" | "simulate" | "decide" | "act" | "reflect";

export type MobiusMode = "dormant" | "manual_tick" | "scheduled";

export type MobiusRisk = "low" | "medium" | "high" | "critical";

export type MobiusConfig = {
  enabled: boolean;
  mode: MobiusMode;
  tickIntervalMs?: number;
  minConfidenceToAct: number;
  maxAutoRisk: MobiusRisk;
};

export type MobiusTickRequest = {
  iuPartnerId: string;
  intentId?: string;
  description?: string;
};

export type MobiusPhaseResult = {
  phase: MobiusPhase;
  ok: boolean;
  note?: string;
  data?: unknown;
};

export type MobiusTickResult = {
  ok: boolean;
  reason?: string;
  phaseResults: MobiusPhaseResult[];
  actionPlan?: unknown;
  executed?: boolean;
  auditId?: string;
};

export const DEFAULT_MOBIUS_CONFIG: MobiusConfig = {
  enabled: false,
  mode: "dormant",
  minConfidenceToAct: 0.8,
  maxAutoRisk: "low",
};
