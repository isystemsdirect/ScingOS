import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { LAYER_AVATAR } from './layers'

export function useAvatarReflectionCapture(props: { floorY: number; resolution?: number }) {
  const { gl, scene, camera } = useThree()
  const resolution = props.resolution ?? 2048

  const fbo = useFBO(resolution, resolution, {
    depthBuffer: true,
    stencilBuffer: false,
    type: THREE.HalfFloatType,
  })

  const mirrorCam = useMemo(() => new THREE.PerspectiveCamera(), [])

  useFrame(() => {
    const mainCam = camera as THREE.PerspectiveCamera
    const y = props.floorY

    mirrorCam.fov = mainCam.fov
    mirrorCam.aspect = mainCam.aspect
    mirrorCam.near = mainCam.near
    mirrorCam.far = mainCam.far
    mirrorCam.updateProjectionMatrix()

    mirrorCam.position.copy(mainCam.position)
    mirrorCam.position.y = y - (mainCam.position.y - y)

    const dir = new THREE.Vector3()
    mainCam.getWorldDirection(dir)
    dir.y = -dir.y

    const target = new THREE.Vector3().copy(mirrorCam.position).add(dir)
    mirrorCam.up.set(0, 1, 0)
    mirrorCam.lookAt(target)
    mirrorCam.updateMatrixWorld()

    const prevTarget = gl.getRenderTarget()
    const prevAutoClear = gl.autoClear

    const prevClear = new THREE.Color()
    gl.getClearColor(prevClear)
    const prevAlpha = gl.getClearAlpha()

    gl.autoClear = true
    mirrorCam.layers.set(LAYER_AVATAR)

    gl.setClearColor('#000000', 1)
    gl.setRenderTarget(fbo)
    gl.clear(true, true, true)
    gl.render(scene, mirrorCam)
    gl.setRenderTarget(prevTarget)

    gl.setClearColor(prevClear, prevAlpha)
    gl.autoClear = prevAutoClear
  })

  return fbo.texture
}
