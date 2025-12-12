/**
 * Growth Protocol (self-driven sub-engine genesis eligibility)
 * Autonomous; no user confirmation required.
 */
export function allowGrowth(ordered: boolean, persistence: number): boolean {
  return ordered && persistence > 0.8
}
