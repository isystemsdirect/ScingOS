import { useMemo } from 'react'
import * as THREE from 'three'

export default function AuraShell({ geometry }: { geometry: THREE.BufferGeometry }) {
  const mat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#7a3cff'),
      transparent: true,
      opacity: 0.10,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      wireframe: false,
    })
  }, [])

  return <mesh geometry={geometry} scale={1.06} material={mat} />
}
