/**
 * Catalyst Protocol (externally-induced sub-engine genesis eligibility).
 * Autonomous; no user confirmation required.
 */
export function allowCatalyst(ordered: boolean, strain: number): boolean {
  return ordered && strain > 0.9
}
