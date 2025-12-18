import { clampEntropy } from './AvatarStateVector'

export function integrateEntropy(current: number, time: number): number {
  // Deterministic micro-entropy injection (no RNG calls).
  // Roughly ~0.001 perturbation per frame at 60fps.
  const n = Math.sin(time * 12.0 + Math.sin(time * 2.1))
  const perturb = n * 0.001
  return clampEntropy(current + perturb)
}
