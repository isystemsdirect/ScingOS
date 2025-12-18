import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { LAYER_AVATAR } from './layers'
import { useDevOptions } from '../dev/useDevOptions'

type Props = {
  positionY?: number
  size?: number
}

export default function ReflectionFloor({ positionY = -1.05, size = 18 }: Props) {
  const { gl, scene, camera } = useThree()
  const { reflection } = useDevOptions()

  const planeRef = useRef<THREE.Mesh>(null!)

  // Offscreen target that contains ONLY the avatar layer render
  const fbo = useFBO(2048, 2048, {
    depthBuffer: true,
    stencilBuffer: false,
    type: THREE.HalfFloatType,
  })

  // Virtual mirror camera (mirrors main camera across the floor plane)
  const mirrorCam = useMemo(() => new THREE.PerspectiveCamera(), [])

  // Unlit floor shader: samples reflection texture + subtle distortion
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: false,
      uniforms: {
        tReflect: { value: fbo.texture },
        strength: { value: 1.0 },
        mirror: { value: 0.55 },
        distortion: { value: 0.18 },
        time: { value: 0.0 },
      },
      vertexShader: /* glsl */ `         varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: /* glsl */ `
varying vec2 vUv;
uniform sampler2D tReflect;
uniform float strength;
uniform float mirror;
uniform float distortion;
uniform float time;


    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
    }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p);
      f=f*f*(3.0-2.0*f);
      float a=hash(i);
      float b=hash(i+vec2(1,0));
      float c=hash(i+vec2(0,1));
      float d=hash(i+vec2(1,1));
      return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
    }

    void main(){
      // flip Y to look like a mirror
      vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

      // organic wobble (deterministic)
      float n = noise(vUv*6.0 + vec2(time*0.12, time*0.09));
      vec2 wobble = (n - 0.5) * distortion * vec2(0.06, 0.03);

      vec3 refl = texture2D(tReflect, uv + wobble).rgb;

      // keep floor black, only add mirrored avatar energy
      vec3 base = vec3(0.01, 0.01, 0.015);
      vec3 outCol = base + refl * mirror * strength;

      gl_FragColor = vec4(outCol, 1.0);
    }
  `,
    })
    m.toneMapped = false
    return m

  }, [fbo.texture])

  useFrame(({ clock }) => {
    if (!reflection.enabled) return


    const t = clock.getElapsedTime()
    mat.uniforms.time.value = t
    mat.uniforms.strength.value = reflection.strength
    mat.uniforms.mirror.value = reflection.mirror
    mat.uniforms.distortion.value = reflection.distortion

    // mirror main camera across Y = positionY
    const mainCam = camera as THREE.PerspectiveCamera
    mirrorCam.fov = mainCam.fov
    mirrorCam.aspect = mainCam.aspect
    mirrorCam.near = mainCam.near
    mirrorCam.far = mainCam.far
    mirrorCam.updateProjectionMatrix()

    mirrorCam.position.copy(mainCam.position)
    mirrorCam.position.y = positionY - (mainCam.position.y - positionY)

    // mirror the look direction
    const dir = new THREE.Vector3()
    mainCam.getWorldDirection(dir)
    const target = new THREE.Vector3().copy(mainCam.position).add(dir)
    target.y = positionY - (target.y - positionY)
    mirrorCam.lookAt(target)
    mirrorCam.updateMatrixWorld()

    // render ONLY avatar layer into fbo (no lights/floor/env layers)
    const prevTarget = gl.getRenderTarget()
    const prevAutoClear = gl.autoClear
    gl.autoClear = true

    mirrorCam.layers.set(LAYER_AVATAR)

    gl.setRenderTarget(fbo)
    gl.clear(true, true, true)
    gl.render(scene, mirrorCam)
    gl.setRenderTarget(prevTarget)

    gl.autoClear = prevAutoClear

  })

  return (
    <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, positionY, 0]}>
      <planeGeometry args={[size, size]} />
      {/* Unlit: ignores all lights by design */} <primitive object={mat} attach="material" /> </mesh>
  )
}
