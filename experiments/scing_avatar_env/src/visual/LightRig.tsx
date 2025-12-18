import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function LightRig() {
  const key = useRef<THREE.DirectionalLight>(null!)
  const rim = useRef<THREE.DirectionalLight>(null!)
  const fill = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Key sweeps in a slow arc
    key.current.position.set(
      3.2 + Math.cos(t * 0.35) * 1.2,
      2.6 + Math.sin(t * 0.28) * 1.0,
      2.8 + Math.sin(t * 0.22) * 1.1
    )

    // Rim is opposite for silhouette pop
    rim.current.position.set(
      -3.0 + Math.sin(t * 0.30) * 0.8,
      2.0 + Math.cos(t * 0.25) * 0.6,
      -2.6 + Math.cos(t * 0.18) * 0.8
    )

    // Fill breathes
    fill.current.intensity = 0.55 + 0.15 * (0.5 + 0.5 * Math.sin(t * 0.6))
  })

  return (
    <>
      <ambientLight intensity={0.16} />
      <directionalLight ref={key} intensity={1.25} />
      <directionalLight ref={rim} intensity={0.95} />
      <pointLight ref={fill} position={[0, -1.5, 2]} intensity={0.6} distance={8} />
    </>
  )
}
