import * as THREE from 'three'
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

export default function FloorReflection(props: {
  enabled: boolean
  avatarColor: THREE.Color
  avatarIntensity: number
  avatarIntensityRef?: React.RefObject<number>
  hoverHeight: number
  radius: number
  sharpness: number
}) {
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        enabled: { value: 1 },
        avatarColor: { value: new THREE.Color(1, 1, 1) },
        avatarIntensity: { value: 0.55 },
        hoverHeight: { value: 0.165 },
        radius: { value: 0.45 },
        sharpness: { value: 3.25 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;

        uniform float time;
        uniform float enabled;
        uniform vec3 avatarColor;
        uniform float avatarIntensity;
        uniform float hoverHeight;
        uniform float radius;
        uniform float sharpness;

        float sat(float x){ return clamp(x, 0.0, 1.0); }

        // Deterministic noise (no Math.random)
        float hash(vec2 p){
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p){
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main(){
          if (enabled < 0.5) {
            gl_FragColor = vec4(0.0);
            return;
          }

          vec2 p = vUv - vec2(0.5);
          float r = length(p);

          // Hover-scaled condensation: higher hover -> tighter, dimmer.
          float hoverTight = 1.0 / (1.0 + hoverHeight * 2.5);

          float rad = max(0.10, radius) * hoverTight;
          float x = r / rad;

          // Tight gaussian-ish falloff
          float core = exp(-sharpness * x * x);

          // Subtle deterministic shimmer in the core only
          float n = noise(vUv * 12.0 + vec2(time * 0.10, time * 0.07));
          float shimmer = (n - 0.5) * 0.10;
          core *= (1.0 + shimmer * sat(1.0 - x));

          float k = sat(avatarIntensity) * core;
          // Reflection/contact light only. No base floor color.
          vec3 col = avatarColor * k;
          float a = sat(k * 1.25);
          gl_FragColor = vec4(col, a);
        }
      `,
    })

    m.toneMapped = false
    return m
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mat.uniforms.time.value = t
    mat.uniforms.enabled.value = props.enabled ? 1 : 0
    ;(mat.uniforms.avatarColor.value as THREE.Color).copy(props.avatarColor)
    mat.uniforms.avatarIntensity.value = props.avatarIntensityRef?.current ?? props.avatarIntensity
    mat.uniforms.hoverHeight.value = props.hoverHeight
    mat.uniforms.radius.value = props.radius
    mat.uniforms.sharpness.value = props.sharpness
  })

  return <primitive object={mat} attach="material" />
}
