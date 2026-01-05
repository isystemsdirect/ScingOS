import type { Risk } from "../../shared/scing/delegation";

const RISK_ORDER: Record<Risk, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function riskLeq(a: Risk, b: Risk): boolean {
  return RISK_ORDER[a] <= RISK_ORDER[b];
}
