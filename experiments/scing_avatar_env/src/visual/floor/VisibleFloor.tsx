import * as THREE from 'three'
import { useMemo } from 'react'

import { useDevOptionsStore } from '../../dev/useDevOptionsStore'
import { LAYER_ENV } from '../layers'

export default function VisibleFloor(props: { size?: number }) {
  const opt = useDevOptionsStore()
  const size = props.size ?? 18

  const setEnvLayer = useMemo(
    () => (o: THREE.Object3D) => {
      o.layers.set(LAYER_ENV)
    },
    [],
  )

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, opt.floor.floorY, 0]}
      onUpdate={setEnvLayer}
      receiveShadow
      visible={opt.floor.floorVisible}
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={'#05020b'} roughness={0.92} metalness={0.0} />
    </mesh>
  )
}
