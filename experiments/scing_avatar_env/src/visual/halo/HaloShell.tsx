import * as THREE from 'three'
import { useRef } from 'react'
import { extend } from '@react-three/fiber'

import { HaloShellMaterial, type HaloShellMaterialImpl } from './HaloShellMaterial'

extend({ HaloShellMaterial })

export default function HaloShell(props: {
  geometry: THREE.BufferGeometry
  scale: number
  onUpdate?: (o: THREE.Object3D) => void
  materialRef?: React.RefObject<HaloShellMaterialImpl>
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={meshRef} geometry={props.geometry} scale={props.scale} onUpdate={props.onUpdate} frustumCulled={false}>
      <haloShellMaterial ref={props.materialRef as any} />
    </mesh>
  )
}
