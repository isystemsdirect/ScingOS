/**
 * Motion field: converts influence into deformation params.
 * Canon: always drifted; no looped curves; no replay.
 */
export function motionDeform(influence: number[]): number[] {
  return influence.map((v, i) => v * (0.9 + Math.random() * 0.2) + Math.sin(v + i) * (Math.random() * 0.02))
}
