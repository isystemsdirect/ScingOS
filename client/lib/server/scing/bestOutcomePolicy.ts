import type { Risk } from "../../shared/scing/delegation";

export type OutcomeOption = {
  id: string;
  description: string;
  expectedBenefit: number; // 0..1
  expectedCost: number; // 0..1
  risk: Risk;
  reversibility: number; // 0..1
  complianceOk: boolean;
};

export function chooseBestOutcome(
  options: OutcomeOption[],
  constraints: { maxRisk: Risk; mustBeReversibleMin: number; requireCompliance: boolean }
): OutcomeOption | null {
  const allowed = options.filter(
    (o) =>
      (o.complianceOk || !constraints.requireCompliance) &&
      o.reversibility >= constraints.mustBeReversibleMin &&
      riskLeq(o.risk, constraints.maxRisk)
  );

  if (!allowed.length) return null;

  allowed.sort(
    (a, b) =>
      b.expectedBenefit -
      b.expectedCost +
      b.reversibility * 0.2 -
      (a.expectedBenefit - a.expectedCost + a.reversibility * 0.2)
  );

  return allowed[0];
}

export function riskLeq(a: Risk, b: Risk) {
  const w = { low: 1, medium: 2, high: 3, critical: 4 } as const;
  return w[a] <= w[b];
}
