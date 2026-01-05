import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'

import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import { getMobiusTelemetry } from '../influence/InfluenceBridge'

type AnyUniforms = Record<string, { value: unknown } | undefined>

function setU(uniforms: AnyUniforms | undefined, key: string, v: unknown) {
  const u = uniforms?.[key]
  if (!u) return
  u.value = v
}

// SCING family endpoints (canonical)
const SCING_A = new THREE.Color('#00c7ff')
const SCING_B = new THREE.Color('#7a2cff')
const SCING_C = new THREE.Color('#ff2bd6')

export default function HaloSmokeShell(props: {
  radius: number
  density: number
  intensity: number
  advectionSpeed: number
  noiseScale: number
}) {
  const opt = useDevOptionsStore()

  const meshRef = useRef<Mesh>(null)

  const geom = useMemo(() => {
    // Slightly larger than the avatar; enough segments for smooth density gradients.
    return new THREE.SphereGeometry(1, 96, 96)
  }, [])

  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        rhythm: { value: 0.5 },
        radius: { value: 1.0 },
        density: { value: 0.55 },
        intensity: { value: 0.22 },
        advection: { value: 0.10 },
        noiseScale: { value: 2.2 },
        emissive: { value: new THREE.Color('#7a2cff') },
      },
      vertexShader: /* glsl */ `
varying vec3 vLocal;
varying vec3 vWorld;
void main(){
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
      `,
      fragmentShader: /* glsl */ `
precision highp float;

varying vec3 vLocal;
varying vec3 vWorld;

uniform float time;
uniform float rhythm;
uniform float radius;
uniform float density;
uniform float intensity;
uniform float advection;
uniform float noiseScale;
uniform vec3 emissive;

// Deterministic hash/noise (no RNG, no textures)
float hash11(float p){
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash31(vec3 p){
  // Stable 3D hash from position
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise3(vec3 p){
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f*f*(3.0-2.0*f);

  float n000 = hash31(i + vec3(0.0,0.0,0.0));
  float n100 = hash31(i + vec3(1.0,0.0,0.0));
  float n010 = hash31(i + vec3(0.0,1.0,0.0));
  float n110 = hash31(i + vec3(1.0,1.0,0.0));
  float n001 = hash31(i + vec3(0.0,0.0,1.0));
  float n101 = hash31(i + vec3(1.0,0.0,1.0));
  float n011 = hash31(i + vec3(0.0,1.0,1.0));
  float n111 = hash31(i + vec3(1.0,1.0,1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);
  return mix(nxy0, nxy1, f.z);
}

float fbm(vec3 p){
  float a = 0.55;
  float v = 0.0;
  v += a * noise3(p); p *= 2.02; a *= 0.55;
  v += a * noise3(p); p *= 2.01; a *= 0.55;
  v += a * noise3(p); p *= 2.03; a *= 0.55;
  v += a * noise3(p);
  return v;
}

void main(){
  // Radial shell mask (soft, bounded)
  float r = length(vLocal);
  float inner = radius * 0.82;
  float outer = radius * 1.02;
  float shell = smoothstep(inner, inner + 0.06*radius, r) * (1.0 - smoothstep(outer - 0.06*radius, outer, r));

  if (shell <= 0.0001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float t = time;
  float adv = (0.25 + 0.75 * clamp(rhythm, 0.0, 1.0)) * advection;
  vec3 p = vWorld * noiseScale;
  // Slow deterministic advection (no randomness)
  p += vec3(t * adv, -t * adv * 0.7, t * adv * 0.55);

  float n = fbm(p);
  // Cloud density: keep it smooth and never opaque
  float d = clamp(density, 0.0, 1.0);
  float cloud = smoothstep(0.35 - 0.18*d, 0.92, n);

  // Stronger near the inner edge, dissipates outward
  float radial = 1.0 - smoothstep(inner, outer, r);

  float a = shell * cloud * radial;
  // Bounded alpha: never floods the screen.
  float k = clamp(intensity, 0.0, 1.0);
  a = clamp(a * (0.12 + 0.58 * k), 0.0, 0.38);

  vec3 col = emissive;
  gl_FragColor = vec4(col * a, a);
}
      `,
    })

    m.toneMapped = false
    return m
  }, [])

  const tmpColor = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Respect visibility toggles.
    const haloVisible = opt.avatar.haloEnabled && opt.haloFlares.haloEnabled
    if (meshRef.current) meshRef.current.visible = haloVisible
    if (!haloVisible) return

    const uniforms = mat.uniforms as AnyUniforms
    setU(uniforms, 'time', t)
    setU(uniforms, 'rhythm', opt.state.rhythm)
    setU(uniforms, 'radius', Math.max(0.001, props.radius))
    setU(uniforms, 'density', Math.max(0, Math.min(1, props.density)))
    setU(uniforms, 'intensity', Math.max(0, Math.min(1, props.intensity)))
    setU(uniforms, 'advection', Math.max(0, Math.min(2, props.advectionSpeed)))
    setU(uniforms, 'noiseScale', Math.max(0.1, Math.min(12, props.noiseScale)))

    // Color: SCING family, optionally nudged by Möbius amplitude (still within SCING family).
    const telem = getMobiusTelemetry()
    const a = telem ? Math.max(0, Math.min(1, telem.inversionAmplitude)) : 0

    // Blend SCING palette deterministically: A->B->C with amplitude as mix bias.
    tmpColor.copy(SCING_A)
    tmpColor.lerp(SCING_B, 0.55 + 0.20 * a)
    tmpColor.lerp(SCING_C, 0.10 + 0.25 * a)

    const u = uniforms.emissive
    if (u && u.value && u.value instanceof THREE.Color) (u.value as THREE.Color).copy(tmpColor)
    else setU(uniforms, 'emissive', tmpColor.clone())
  })

  return (
    <mesh ref={meshRef} geometry={geom} material={mat} scale={props.radius} frustumCulled={false} />
  )
}
