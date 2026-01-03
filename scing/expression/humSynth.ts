/**
 * Hum synth: audible silhouette of presence.
 * Canon: no looped samples; no reset phases.
 */
export function humValue(influence: number[]): number {
  let v = 0;
  for (let i = 0; i < influence.length; i++) {
    v += Math.sin(influence[i] + i * 0.13) * (0.6 + Math.random() * 0.8);
  }
  return v / (influence.length || 1);
}
