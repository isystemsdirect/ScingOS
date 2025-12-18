import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import { useAvatarReflectionCapture } from './AvatarReflectionCapture'

export default function FloorEcho(props: { floorY: number; size?: number }) {
  const opt = useDevOptionsStore()
  const size = props.size ?? 18

  const tex = useAvatarReflectionCapture({ floorY: props.floorY, resolution: 2048 })

  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: false,
      uniforms: {
        tCapture: { value: tex },
        time: { value: 0 },
        enabled: { value: 1 },
        strength: { value: 0.18 },
        blur: { value: 0.65 },
        squash: { value: 0.55 },
        radius: { value: 0.7 },
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
uniform sampler2D tCapture;
uniform float time;
uniform float enabled;
uniform float strength;
uniform float blur;
uniform float squash;
uniform float radius;

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

vec3 blur9(vec2 uv, float r){
  vec2 px = vec2(r);
  vec3 c = vec3(0.0);
  c += texture2D(tCapture, uv + px*vec2(-1.0,-1.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2( 0.0,-1.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2( 1.0,-1.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2(-1.0, 0.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2( 0.0, 0.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2( 1.0, 0.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2(-1.0, 1.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2( 0.0, 1.0)).rgb;
  c += texture2D(tCapture, uv + px*vec2( 1.0, 1.0)).rgb;
  return c / 9.0;
}

void main(){
  vec3 base = vec3(0.01, 0.01, 0.015);
  if (enabled < 0.5) {
    gl_FragColor = vec4(base, 1.0);
    return;
  }

  // mirror-like read, but treated as an "echo" (diffuse + compressed + fades out)
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

  // squash vertical energy toward center
  float s = mix(0.25, 1.0, squash);
  uv.y = 0.5 + (uv.y - 0.5) * s;

  // deterministic wobble for organic smear
  float n = noise(vUv * 6.0 + vec2(time * 0.10, time * 0.07));
  vec2 wobble = (n - 0.5) * 0.02 * blur;

  // cheap blur radius (in UV units)
  float r = mix(0.0005, 0.0045, blur);
  vec3 echo = blur9(uv + wobble, r);

  // radial falloff to keep it near the avatar footprint
  float d = length(vUv - vec2(0.5));
  float maxR = mix(0.15, 0.75, radius);
  float mask = 1.0 - smoothstep(maxR, maxR + 0.10, d);

  vec3 outCol = base + echo * (strength * mask);
  gl_FragColor = vec4(outCol, 1.0);
}
      `,
    })

    m.toneMapped = false
    return m
  }, [tex])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mat.uniforms.time.value = t
    mat.uniforms.enabled.value = opt.floorEchoEnabled ? 1 : 0
    mat.uniforms.strength.value = opt.floorEchoStrength
    mat.uniforms.blur.value = opt.floorEchoBlur
    mat.uniforms.squash.value = opt.floorEchoSquash
    mat.uniforms.radius.value = opt.floorEchoRadius
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, props.floorY, 0]}>
      <planeGeometry args={[size, size]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}
