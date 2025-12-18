import { useMemo } from 'react'
import * as THREE from 'three'

export default function Backdrop() {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const count = 4000
    const pos = new Float32Array(count * 3)
    const r = 40
    for (let i = 0; i < count; i++) {
      // deterministic pseudo-random distribution using trig
      const a = (i * 12.9898) % (Math.PI * 2)
      const b = (i * 78.233) % (Math.PI)
      const rad = r * (0.25 + 0.75 * ((Math.sin(i * 0.17) * 0.5 + 0.5)))
      const x = Math.cos(a) * Math.sin(b) * rad
      const y = Math.cos(b) * rad
      const z = Math.sin(a) * Math.sin(b) * rad
      pos[i * 3 + 0] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  return (
    <points geometry={geom}>
      <pointsMaterial size={0.035} sizeAttenuation depthWrite={false} transparent opacity={0.85} />
    </points>
  )
}
