export function environmentSignals(influence: number[]) {
  const density = influence.reduce((a, b) => a + Math.abs(b), 0) / (influence.length || 1)
  const glow = clamp01(density * 0.9 + Math.random() * 0.05)
  const breath = clamp01((1 - density) * 0.6 + Math.random() * 0.05)
  return { glow, breath }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}
