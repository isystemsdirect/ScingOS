/**
 * Order & Focus Protocol
 * Scing engineers solutions only when order/focus naturally emerge.
 * This is a gate, not a mode.
 */
export function orderAndFocus(influence: number[]): boolean {
  if (!influence?.length) return false
  const meanAbs = influence.reduce((a, b) => a + Math.abs(b), 0) / influence.length
  return meanAbs < 0.75
}
