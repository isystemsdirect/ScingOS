import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

import { LAYER_AVATAR } from '../layers'

export type AvatarReflectionTargetResult = {
  texture: THREE.Texture
  size: number
}

export default function AvatarReflectionTarget(props: {
  enabled: boolean
  size?: number
  planeY?: number
  onReady: (result: AvatarReflectionTargetResult) => void
}) {
  const enabled = props.enabled
  const size = props.size ?? 1024
  const planeY = props.planeY ?? 0

  const { gl, scene, camera } = useThree()

  const fbo = useFBO(size, size, {
    depthBuffer: true,
    stencilBuffer: false,
    type: THREE.HalfFloatType,
  })

  const mirrorCam = useMemo(() => new THREE.PerspectiveCamera(), [])

  useEffect(() => {
    props.onReady({ texture: fbo.texture, size })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbo.texture, size])

  useFrame(() => {
    if (!enabled) return

    const mainCam = camera as THREE.PerspectiveCamera

    mirrorCam.fov = mainCam.fov
    mirrorCam.aspect = 1
    mirrorCam.near = mainCam.near
    mirrorCam.far = mainCam.far
    mirrorCam.updateProjectionMatrix()

    // Mirror camera across the floor plane at y=planeY.
    mirrorCam.position.copy(mainCam.position)
    mirrorCam.position.y = planeY - (mainCam.position.y - planeY)

    const dir = new THREE.Vector3()
    mainCam.getWorldDirection(dir)
    const target = new THREE.Vector3().copy(mainCam.position).add(dir)
    target.y = planeY - (target.y - planeY)

    mirrorCam.up.copy(mainCam.up)
    mirrorCam.lookAt(target)
    mirrorCam.updateMatrixWorld()

    // Avatar-only capture.
    mirrorCam.layers.set(LAYER_AVATAR)

    const prevTarget = gl.getRenderTarget()
    const prevAutoClear = gl.autoClear

    gl.autoClear = true
    gl.setRenderTarget(fbo)
    gl.clear(true, true, true)
    gl.render(scene, mirrorCam)
    gl.setRenderTarget(prevTarget)
    gl.autoClear = prevAutoClear
  })

  return null
}
