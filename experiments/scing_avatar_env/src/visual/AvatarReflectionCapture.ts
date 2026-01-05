import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { LAYER_AVATAR } from './layers'

export function useAvatarReflectionCapture(props: {
  floorY: number
  resolution?: number
  enabled?: boolean
  clipBias?: number
}) {
  const { gl, scene, camera } = useThree()
  const resolution = props.resolution ?? 2048
  const enabled = props.enabled ?? true
  const clipBias = props.clipBias ?? 0

  const fboRef = useRef<THREE.WebGLRenderTarget | null>(null)
  const tmpDir = useMemo(() => new THREE.Vector3(), [])
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])
  const tmpClear = useMemo(() => new THREE.Color(), [])

  const mirrorCam = useMemo(() => new THREE.PerspectiveCamera(), [])

  if (!fboRef.current) {
    fboRef.current = new THREE.WebGLRenderTarget(resolution, resolution, {
      depthBuffer: true,
      stencilBuffer: false,
      type: THREE.HalfFloatType,
    })
    fboRef.current.texture.name = 'avatar-reflection-capture'
  }

  useEffect(() => {
    if (!fboRef.current) return
    fboRef.current.setSize(resolution, resolution)
  }, [resolution])

  useEffect(() => {
    const fbo = fboRef.current
    return () => {
      if (fbo) fbo.dispose()
      fboRef.current = null
    }
  }, [])

  useFrame(() => {
    if (!enabled) return
    const fbo = fboRef.current
    if (!fbo) return

    const mainCam = camera as THREE.PerspectiveCamera
    const y = props.floorY + clipBias

    mirrorCam.fov = mainCam.fov
    mirrorCam.aspect = mainCam.aspect
    mirrorCam.near = mainCam.near
    mirrorCam.far = mainCam.far
    mirrorCam.updateProjectionMatrix()

    mirrorCam.position.copy(mainCam.position)
    mirrorCam.position.y = y - (mainCam.position.y - y)

    mainCam.getWorldDirection(tmpDir)
    tmpDir.y = -tmpDir.y

    tmpTarget.copy(mirrorCam.position).add(tmpDir)
    mirrorCam.up.set(0, 1, 0)
    mirrorCam.lookAt(tmpTarget)
    mirrorCam.updateMatrixWorld()

    const prevTarget = gl.getRenderTarget()
    const prevAutoClear = gl.autoClear

    gl.getClearColor(tmpClear)
    const prevAlpha = gl.getClearAlpha()

    gl.autoClear = true
    mirrorCam.layers.set(LAYER_AVATAR)

    gl.setClearColor('#000000', 1)
    gl.setRenderTarget(fbo)
    gl.clear(true, true, true)
    gl.render(scene, mirrorCam)
    gl.setRenderTarget(prevTarget)

    gl.setClearColor(tmpClear, prevAlpha)
    gl.autoClear = prevAutoClear
  })

  return fboRef.current.texture
}
