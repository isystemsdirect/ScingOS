import DeterministicStarfield from './DeterministicStarfield'

// Deterministic starfield wrapper (no Math.random at runtime)
export default function Starfield() {
  return <DeterministicStarfield seed={1337} count={3500} radius={70} size={0.010} />
}
