/**
 * Determinism guard: disallow explicit seeds in expression pipelines.
 */
export function forbidDeterministicSeed(seed: unknown) {
  if (seed !== undefined && seed !== null) {
    throw new Error('Guardrail: deterministic seed detected')
  }
}
