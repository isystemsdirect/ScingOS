import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import { LAYER_ENV } from '../layers'

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

export default function FloorReflectionPlane(props: {
  enabled: boolean
  texture: THREE.Texture | null
  targetSize: number
  size?: number
  strength: number
  blur: number
  height: number
}) {
  const enabled = props.enabled
  const size = props.size ?? 18

  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: false,
      depthWrite: true,
      uniforms: {
        tReflect: { value: props.texture },
        hasTex: { value: props.texture ? 1.0 : 0.0 },
        strength: { value: 0.0 },
        blur: { value: 0.0 },
        height: { value: 0.33 },
        time: { value: 0.0 },
        texel: { value: new THREE.Vector2(1 / Math.max(1, props.targetSize), 1 / Math.max(1, props.targetSize)) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;

        uniform sampler2D tReflect;
        uniform float hasTex;
        uniform float strength;
        uniform float blur;
        uniform float height;
        uniform float time;
        uniform vec2 texel;

        float hash(vec2 p){
          return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
        }

        float noise(vec2 p){
          vec2 i=floor(p), f=fract(p);
          f=f*f*(3.0-2.0*f);
          float a=hash(i);
          float b=hash(i+vec2(1.0,0.0));
          float c=hash(i+vec2(0.0,1.0));
          float d=hash(i+vec2(1.0,1.0));
          return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
        }

        vec3 sampleBlur(sampler2D tex, vec2 uv, float b){
          // 5-tap deterministic blur approximation.
          vec2 o = texel * (2.0 + 10.0 * b);
          vec3 c0 = texture2D(tex, uv).rgb;
          vec3 c1 = texture2D(tex, uv + vec2( o.x, 0.0)).rgb;
          vec3 c2 = texture2D(tex, uv + vec2(-o.x, 0.0)).rgb;
          vec3 c3 = texture2D(tex, uv + vec2(0.0,  o.y)).rgb;
          vec3 c4 = texture2D(tex, uv + vec2(0.0, -o.y)).rgb;
          return (c0 * 0.36 + (c1 + c2 + c3 + c4) * 0.16);
        }

        void main(){
          // Floor base stays near-black.
          vec3 base = vec3(0.005, 0.005, 0.008);

          if (hasTex < 0.5 || strength <= 0.0001) {
            gl_FragColor = vec4(base, 1.0);
            return;
          }

          // Mirror Y for reflection.
          vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

          // Organic distortion (deterministic).
          float n = noise(vUv * 6.0 + vec2(time * 0.12, time * 0.09));
          vec2 wobble = (n - 0.5) * (0.010 + 0.020 * blur) * vec2(1.0, 0.6);

          // Height shapes falloff: higher -> longer reflection reach.
          float h = max(0.05, height);
          float yFade = smoothstep(0.0, 1.0, (1.0 - vUv.y) / h);

          // Radial falloff to keep it subtle and non-room-like.
          vec2 p = vUv - 0.5;
          float r = length(p);
          float rFade = smoothstep(0.60, 0.10, r);

          float fade = yFade * rFade;

          vec3 refl = sampleBlur(tReflect, uv + wobble, blur);

          // Keep it premium/subtle.
          vec3 outCol = base + refl * (strength * fade);

          gl_FragColor = vec4(outCol, 1.0);
        }
      `,
    })

    m.toneMapped = false
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(({ clock }) => {
    if (!matRef.current) return

    const strength = clamp01(props.strength)
    const blur = clamp01(props.blur)
    const height = clamp01(props.height)

    matRef.current.uniforms.time.value = clock.getElapsedTime()
    matRef.current.uniforms.tReflect.value = props.texture
    matRef.current.uniforms.hasTex.value = props.texture ? 1.0 : 0.0
    matRef.current.uniforms.strength.value = enabled ? strength : 0
    matRef.current.uniforms.blur.value = blur
    matRef.current.uniforms.height.value = height
    matRef.current.uniforms.texel.value.set(1 / Math.max(1, props.targetSize), 1 / Math.max(1, props.targetSize))
  })

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onUpdate={(o) => o.layers.set(LAYER_ENV)}
    >
      <planeGeometry args={[size, size]} />
      <primitive object={material} attach="material" ref={matRef as any} />
    </mesh>
  )
}
