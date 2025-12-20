import * as THREE from 'three'
import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Sprite } from 'three'
import { getAvatarState, getMobiusTelemetry } from '../influence/InfluenceBridge'

// Deterministic “flare anchor” generator (no Math.random)
function hash1(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function makeSoftRadialTexture(size = 64) {
  const data = new Uint8Array(size * size * 4)
  const cx = (size - 1) * 0.5
  const cy = (size - 1) * 0.5
  const invR = 1 / Math.max(1e-6, Math.min(cx, cy))

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - cx) * invR
      const dy = (y - cy) * invR
      const r = Math.sqrt(dx * dx + dy * dy)

      // Soft gaussian-ish falloff; keeps center hot but edges smooth.
      const a = Math.max(0, 1 - r)
      const alpha = Math.pow(a, 2.4)

      const idx = (y * size + x) * 4
      data[idx + 0] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = Math.floor(255 * alpha)
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  tex.needsUpdate = true
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

export default function AvatarFlares3D(props: { intensity: number }) {
  const root = useRef<Group>(null)
  const sprites = useRef<Sprite[]>([])

  const anchors = useMemo(() => {
    // 6 anchors in true 3D around the avatar, with varied radii/heights
    return Array.from({ length: 6 }).map((_, idx) => {
      const a = hash1(idx + 1) * Math.PI * 2
      const b = hash1(idx + 11) * 0.8 + 0.2 // height bias
      const r = 0.22 + hash1(idx + 21) * 0.24
      const y = (b - 0.5) * 0.55
      const z = (hash1(idx + 31) - 0.5) * 0.35
      return { a, r, y, z, seed: idx + 1 }
    })
  }, [])

  const tex = useMemo(() => makeSoftRadialTexture(64), [])

  const mats = useMemo(() => {
    // Scing family: blue/violet/magenta — subtle additive highlights
    const cols = [new THREE.Color('#00c7ff'), new THREE.Color('#7a2cff'), new THREE.Color('#ff2bd6')]
    return anchors.map((_, i) => {
      const c = cols[i % cols.length].clone()
      return new THREE.SpriteMaterial({
        map: tex,
        color: c,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.35,
      })
    })
  }, [anchors, tex])

  useFrame(() => {
    const s = getAvatarState()
    const telem = getMobiusTelemetry()
    const t = performance.now() * 0.001

    // Pulse & intensity are avatar-driven, deterministic
    const pulse = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1.2 + 1.4 * s.arousal)))
    const base = (0.10 + 0.55 * s.arousal) * (0.55 + 0.45 * s.focus) * pulse

    // Orbit drift in avatar space (true 3D parallax as camera moves)
    anchors.forEach((h, i) => {
      const sp = sprites.current[i]
      const m = mats[i]
      if (!sp) return

      if (telem) {
        m.color.setRGB(telem.emissiveColor.r, telem.emissiveColor.g, telem.emissiveColor.b)
      }

      const w = 0.55 + 0.35 * s.arousal
      const a = h.a + t * w * (i % 2 === 0 ? 1 : -1) * 0.35
      const rr = h.r * (0.9 + 0.25 * Math.sin(t * 0.7 + h.seed))
      sp.position.set(
        Math.cos(a) * rr,
        h.y + 0.06 * Math.sin(t * 0.9 + h.seed),
        h.z + Math.sin(a) * rr * 0.35,
      )

      // Sprite scale pulses (lens flare “breathing”)
      const sc = 0.22 + base * (0.35 + 0.25 * (i / anchors.length))
      sp.scale.setScalar(sc)

      // Opacity pulses; keeps flares tied to avatar illumination (not floor)
      const k = Math.max(0, Math.min(1.5, props.intensity))
      const amp = telem ? Math.max(0, Math.min(1, telem.inversionAmplitude)) : 0
      const mobiusBoost = 0.85 + 0.85 * amp
      m.opacity = Math.min(0.85, (0.10 + base * 0.75 * k) * mobiusBoost)
    })
  })

  return (
    <group ref={root}>
      {anchors.map((_, i) => (
        <Billboard key={i} follow>
          <sprite
            ref={(el) => {
              if (el) sprites.current[i] = el
            }}
            material={mats[i]}
            position={[0, 0, 0]}
            scale={[0.3, 0.3, 0.3]}
          />
        </Billboard>
      ))}
    </group>
  )
}
