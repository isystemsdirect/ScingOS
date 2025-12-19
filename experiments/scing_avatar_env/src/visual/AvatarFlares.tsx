import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { getAvatarState } from '../influence/InfluenceBridge'

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export default function AvatarFlares(props: {
  enabled: boolean
  radius: number // 0..1
  baseIntensity: number // 0..2
  rate: number // Hz-ish
}) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), [])

  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: {
        time: { value: 0 },
        intensity: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        uniform float intensity;

        float sat(float x) { return clamp(x, 0.0, 1.0); }

        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);

          float core = exp(-r * 4.5);

          // Cross streaks (lens-like) with soft falloff
          float sx = exp(-abs(p.y) * 18.0) * exp(-abs(p.x) * 1.6);
          float sy = exp(-abs(p.x) * 18.0) * exp(-abs(p.y) * 1.6);

          // Deterministic shimmer
          float shimmer = 0.78 + 0.22 * sin(time * 6.2831853);

          float a = intensity * shimmer * (0.62 * core + 0.26 * sx + 0.26 * sy);
          a = sat(a);

          vec3 col = vec3(1.0);
          gl_FragColor = vec4(col * a, a);
        }
      `,
    })

    return m
  }, [])

  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) return

    // Billboard to camera while inheriting avatar transform (because we're mounted inside the avatar group).
    g.quaternion.copy(camera.quaternion)

    const t = clock.getElapsedTime()
    ;(mat.uniforms.time.value as number) = t

    if (!props.enabled) {
      ;(mat.uniforms.intensity.value as number) = 0
      return
    }

    const s = getAvatarState()
    const energy = clamp(0.55 * s.arousal + 0.25 * s.focus + 0.20 * s.rhythm, 0, 1)

    const base = clamp(props.baseIntensity, 0, 2)
    const rate = clamp(props.rate, 0.05, 6.0)
    const pulse = 0.65 + 0.35 * Math.sin(t * rate * 6.2831853)

    const i = base * (0.35 + 0.65 * energy) * pulse
    ;(mat.uniforms.intensity.value as number) = i
  })

  const size = useMemo(() => {
    // Keep deterministic scaling with a small minimum so "radius=0" still remains stable when enabled.
    return 0.15 + 0.85 * clamp(props.radius, 0, 1)
  }, [props.radius])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Core bloom */}
      <mesh geometry={geo} material={mat} scale={[size * 0.85, size * 0.85, 1]} renderOrder={20} />

      {/* Horizontal streak */}
      <mesh
        geometry={geo}
        material={mat}
        scale={[size * 1.6, size * 0.18, 1]}
        position={[0, 0.02, 0]}
        renderOrder={21}
      />

      {/* Vertical streak */}
      <mesh
        geometry={geo}
        material={mat}
        scale={[size * 0.18, size * 1.6, 1]}
        position={[0.02, 0, 0]}
        renderOrder={22}
      />
    </group>
  )
}
