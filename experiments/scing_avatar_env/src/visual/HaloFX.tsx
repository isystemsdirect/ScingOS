import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'

type Props = {
  y?: number
  scale?: number
  intensity?: number // 0..2
  hueShift?: number // -1..1

  avatarPos?: [number, number, number]
  avatarVel?: [number, number, number]
  follow?: number
  flareIntensity?: number
  flareRadius?: number
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

// deterministic hash (no Math.random)
function hash11(x: number) {
  const s = Math.sin(x * 12.9898) * 43758.5453
  return s - Math.floor(s)
}

function createHaloMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      time: { value: 0 },
      intensity: { value: 1 },
      hueShift: { value: 0 },

      flareOffset: { value: new THREE.Vector2(0, 0) },
      flareIntensity: { value: 1 },
      flareRadius: { value: 0.35 },
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
    uniform float intensity;
    uniform float hueShift;

    uniform vec2 flareOffset;
    uniform float flareIntensity;
    uniform float flareRadius;

    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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
    float fbm(vec2 p){
      float v=0.0; float a=0.55;
      for(int i=0;i<5;i++){
        v += a * noise(p);
        p = p*2.02 + vec2(13.7, 9.2);
        a *= 0.55;
      }
      return v;
    }
    vec3 neonCyan(){ return vec3(0.00, 0.85, 1.00); }
    vec3 neonMagenta(){ return vec3(1.00, 0.00, 0.85); }
    vec3 neonViolet(){ return vec3(0.62, 0.22, 1.00); }

    void main(){
      vec2 uv = vUv * 2.0 - 1.0;

      // Avatar-relative flare motion (deterministic)
      uv += flareOffset * flareRadius;

      float r = length(uv);
      float core = smoothstep(0.65, 0.05, r);             // inner glow
      float ring = smoothstep(0.90, 0.55, r) * (1.0-core);// outer band

      // smoky dissipation
      float n = fbm(uv*1.35 + vec2(time*0.07, -time*0.05));
      float smoke = smoothstep(0.25, 0.95, n) * ring;

      // slight flutter (still smooth)
      float flutter = 0.85 + 0.15 * sin(time*0.9 + n*6.0);

      float alpha = (core*0.35 + smoke*0.55) * intensity * flutter;
      alpha *= smoothstep(1.05, 0.20, r); // fade out edge

      vec3 col = mix(neonCyan(), neonMagenta(), 0.5 + 0.5*sin(time*0.25 + hueShift));
      col = mix(col, neonViolet(), 0.35 * smoke);

      // lens-like hot spots
      float streak = pow(max(0.0, 1.0 - abs(uv.y)*18.0), 6.0) * ring;
      float streak2 = pow(max(0.0, 1.0 - abs(uv.x)*22.0), 7.0) * ring;
      col += (streak*0.75 + streak2*0.55) * intensity * flareIntensity;

      gl_FragColor = vec4(col, alpha);
    }
  `,
  })
}

export default function HaloFX({
  y = 0.0,
  scale = 1.35,
  intensity = 1.0,
  hueShift = 0,
  avatarVel,
  follow,
  flareIntensity,
  flareRadius,
}: Props) {
  const material = useMemo(() => createHaloMaterial(), [])
  const mat = useRef<THREE.ShaderMaterial>(material)
  const t = useRef(0)
  const fx = useRef({ x: 0, y: 0 })

  const seed = useMemo(() => 1000 + hash11(17.3) * 1000, [])
  useFrame((_, dt) => {
    t.current += dt
    const m = mat.current
    if (!m) return
    const u = (m as any).uniforms as
      | {
          time?: { value: number }
          intensity?: { value: number }
          hueShift?: { value: number }

          flareOffset?: { value: THREE.Vector2 }
          flareIntensity?: { value: number }
          flareRadius?: { value: number }
        }
      | undefined

    if (!u?.time || !u?.intensity || !u?.hueShift) return

    const f = clamp(follow ?? 0.65, 0, 1)
    const vx = avatarVel?.[0] ?? 0
    const vy = avatarVel?.[1] ?? 0

    // smooth follow
    const k = (1 - Math.exp(-8 * dt)) * f
    fx.current.x += (vx * 0.06 - fx.current.x) * k
    fx.current.y += (vy * 0.06 - fx.current.y) * k

    // Defensive: never throw inside the render loop.
    try {
      u.time.value = t.current + seed
      u.intensity.value = clamp(intensity, 0, 2)
      u.hueShift.value = clamp(hueShift, -1, 1)

      if (u.flareOffset?.value) {
        u.flareOffset.value.set(fx.current.x, fx.current.y)
      }
      if (u.flareIntensity) {
        u.flareIntensity.value = clamp(typeof flareIntensity === 'number' ? flareIntensity : 1.0, 0, 2)
      }
      if (u.flareRadius) {
        u.flareRadius.value = clamp(typeof flareRadius === 'number' ? flareRadius : 0.35, 0, 1)
      }
    } catch {
      // ignore
    }
  })

  return (
    <Billboard position={[0, y, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
      <mesh scale={[scale, scale, 1]}>
        <planeGeometry args={[2, 2, 1, 1]} />
        <primitive object={material} ref={mat} attach="material" />
      </mesh>
    </Billboard>
  )
}
