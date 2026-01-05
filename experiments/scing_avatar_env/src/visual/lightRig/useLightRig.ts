/* @refresh reset */
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'

import type { DevOptions } from '../../state/devOptionsStore'
import { LAYER_AVATAR } from '../layers'

export function useLightRig(opt: DevOptions) {
  const lightRefs = [
    useRef<THREE.SpotLight>(null),
    useRef<THREE.SpotLight>(null),
    useRef<THREE.SpotLight>(null),
    useRef<THREE.SpotLight>(null),
  ] as const

  const targets = useMemo(() => {
    return [new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D()] as const
  }, [])

  const tmpV = useMemo(() => new THREE.Vector3(), [])
  const tmpRadial = useMemo(() => new THREE.Vector3(), [])
  const tmpAlong = useMemo(() => new THREE.Vector3(), [])
  const tmpAxis = useMemo(() => new THREE.Vector3(), [])
  const tmpQuat = useMemo(() => new THREE.Quaternion(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    const rigAngle = opt.lights.rigRotateEnabled ? -opt.lights.rigRotateSpeed * t : 0

    for (let i = 0; i < 4; i++) {
      const s = opt.lights.spots[i]
      const ref = lightRefs[i].current
      const tgt = targets[i]

      tgt.position.set(s.target[0], s.target[1], s.target[2])
      tgt.updateMatrixWorld()

      if (!ref) continue

      ref.layers.set(LAYER_AVATAR)

      const basePos = tmpV.set(s.position[0], s.position[1], s.position[2])
      const orbitEnabled = (s as any).orbitEnabled ?? s.rotationEnabled
      const orbitAxisKey = (s as any).orbitAxis ?? s.rotationAxis
      const orbitSpeed = Number((s as any).orbitSpeed ?? s.rotationRate)
      const orbitRadius = Number((s as any).orbitRadius ?? 0)
      const orbitPhase = Number((s as any).orbitPhase ?? 0)

      if (orbitEnabled && orbitSpeed !== 0) {
        tmpAxis.set(0, 0, 0)
        if (orbitAxisKey === 'x') tmpAxis.set(1, 0, 0)
        if (orbitAxisKey === 'y') tmpAxis.set(0, 1, 0)
        if (orbitAxisKey === 'z') tmpAxis.set(0, 0, 1)

        // Decompose into axis-parallel + radial component around target.
        tmpRadial.copy(basePos).sub(tgt.position)
        const alongLen = tmpRadial.dot(tmpAxis)
        tmpAlong.copy(tmpAxis).multiplyScalar(alongLen)
        tmpRadial.sub(tmpAlong)

        // If orbitRadius is provided, enforce it; otherwise keep current radius.
        const r = orbitRadius > 0 ? orbitRadius : tmpRadial.length()
        if (tmpRadial.lengthSq() < 1e-8) {
          // Degenerate: pick a stable perpendicular direction.
          if (orbitAxisKey === 'y') tmpRadial.set(1, 0, 0)
          else if (orbitAxisKey === 'x') tmpRadial.set(0, 0, 1)
          else tmpRadial.set(1, 0, 0)
        }
        tmpRadial.normalize().multiplyScalar(Math.max(0.001, r))

        // Deterministic counter-rotation: alternating directions by index.
        const dir = i % 2 === 0 ? 1 : -1
        const ang = dir * orbitSpeed * t + orbitPhase
        tmpQuat.setFromAxisAngle(tmpAxis, ang)

        basePos.copy(tmpRadial).applyQuaternion(tmpQuat).add(tmpAlong).add(tgt.position)
      }

      if (rigAngle !== 0) {
        tmpAxis.set(0, 1, 0)
        tmpQuat.setFromAxisAngle(tmpAxis, rigAngle)
        basePos.sub(tgt.position).applyQuaternion(tmpQuat).add(tgt.position)
      }

      ref.position.copy(basePos)
      ref.target = tgt
      ref.updateMatrixWorld()
    }
  })

  return { lightRefs, targets }
}
