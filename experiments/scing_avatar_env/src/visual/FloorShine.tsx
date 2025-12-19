import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

export type FloorShineProps = {
  enabled: boolean
  floorY: number
  followWorldPoint?: THREE.Vector3 | null
  radius: number
  intensity: number
  falloff: number
  // Optional: condense factor multiplier (e.g. from light radiusHints)
  radiusScale?: number
}

export function FloorShine({
  enabled,
  floorY,
  followWorldPoint,
  radius,
  intensity,
  falloff,
  radiusScale = 1,
}: FloorShineProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uCenter: { value: new THREE.Vector3(0, floorY, 0) },
        uRadius: { value: radius },
        uIntensity: { value: intensity },
        uFalloff: { value: falloff },
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec3 vWorld;
        uniform vec3 uCenter;
        uniform float uRadius;
        uniform float uIntensity;
        uniform float uFalloff;

        void main() {
          float d = distance(vWorld.xz, uCenter.xz);
          float r = max(uRadius, 0.0001);
          float x = clamp(d / r, 0.0, 1.0);
          // Smooth, controllable falloff curve
          float a = pow(1.0 - x, uFalloff);
          a *= uIntensity;
          // Soft tint (no new theme colors; keep neutral)
          vec3 col = vec3(1.0);
          gl_FragColor = vec4(col * a, a);
        }
      `,
    })

    return m
  }, [])

  useFrame(() => {
    if (!meshRef.current) return

    // Keep it effectively "infinite" by following camera XZ, centered at target point.
    const center = followWorldPoint ? followWorldPoint : new THREE.Vector3(camera.position.x, floorY, camera.position.z)
    ;(mat.uniforms.uCenter.value as THREE.Vector3).set(center.x, floorY, center.z)
    mat.uniforms.uRadius.value = Math.max(0.02, radius * radiusScale)
    mat.uniforms.uIntensity.value = enabled ? intensity : 0
    mat.uniforms.uFalloff.value = Math.max(0.1, falloff)

    meshRef.current.position.set(camera.position.x, floorY + 0.0005, camera.position.z)
    meshRef.current.scale.set(1, 1, 1)
  })

  // A large plane, camera-centered, never culled.
  return (
    <mesh ref={meshRef} frustumCulled={false} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2000, 2000, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}
