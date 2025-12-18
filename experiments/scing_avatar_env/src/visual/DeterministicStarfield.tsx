import { useMemo } from 'react'
import * as THREE from 'three'

function xorshift32(seed: number) {
  let x = seed | 0
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    // convert to [0,1)
    return ((x >>> 0) & 0xffffffff) / 0x100000000
  }
}

export default function DeterministicStarfield(props: {
  seed?: number
  count?: number
  radius?: number
  size?: number
}) {
  const seed = props.seed ?? 1337
  const count = props.count ?? 3500
  const radius = props.radius ?? 70
  const size = props.size ?? 0.012

  const { positions, colors } = useMemo(() => {
    const rand = xorshift32(seed)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // uniform direction
      const u = rand()
      const v = rand()
      const theta = 2 * Math.PI * u
      const z = v * 2 - 1
      const r = Math.sqrt(Math.max(0, 1 - z * z))

      // push stars into a thick shell to avoid clumping near center
      const shell = radius * (0.65 + 0.35 * rand())
      const x = Math.cos(theta) * r * shell
      const y = z * shell
      const zpos = Math.sin(theta) * r * shell

      const idx = i * 3
      pos[idx + 0] = x
      pos[idx + 1] = y
      pos[idx + 2] = zpos

      // subtle brightness variation only (monochrome)
      const b = 0.65 + 0.35 * Math.pow(rand(), 2.2)
      col[idx + 0] = b
      col[idx + 1] = b
      col[idx + 2] = b
    }

    return { positions: pos, colors: col }
  }, [count, radius, seed])

  return (
    <points frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} count={positions.length / 3} />
        <bufferAttribute attach="attributes-color" array={colors} itemSize={3} count={colors.length / 3} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation
        transparent
        opacity={0.9}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
