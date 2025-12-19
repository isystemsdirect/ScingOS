import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import DeterministicStarfield from './DeterministicStarfield'

// Deterministic starfield wrapper (no Math.random at runtime)
export default function Starfield() {
  const g = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (!g.current) return
    // subtle deep drift (deterministic)
    g.current.rotation.y += dt * 0.006
    g.current.rotation.x = 0.06
  })

  return (
    <group ref={g} position={[0, 0, -60]}>
      <DeterministicStarfield seed={1337} count={2800} radius={110} size={0.0075} opacity={0.16} />
    </group>
  )
}
