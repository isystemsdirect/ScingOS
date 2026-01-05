import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

import { useDevOptionsStore } from '../../dev/useDevOptionsStore'
import { useAvatarReflectionCapture } from '../AvatarReflectionCapture'
import { LAYER_ENV } from '../layers'

export default function ReflectionPlane() {
  const opt = useDevOptionsStore()
  const { camera } = useThree()

  const reflectionMeshRef = useRef<THREE.Mesh>(null)

  const setEnvLayer = useMemo(
    () => (o: THREE.Object3D) => {
      o.layers.set(LAYER_ENV)
    },
    [],
  )

  const tex = useAvatarReflectionCapture({
    floorY: opt.reflection.reflectionGroundY,
    resolution: opt.reflection.reflectionResolution,
    enabled: opt.reflection.reflectionEnabled && opt.reflection.reflectionIntensity > 0,
    clipBias: opt.reflection.reflectionClipBias,
  })

  const echoMat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        tCapture: { value: tex },
        time: { value: 0 },
        enabled: { value: 1 },
        strength: { value: 0.18 },
        blur: { value: 0.55 },
        height: { value: 0.33 },
        fadeStart: { value: 0.0 },
        fadeEnd: { value: 18.0 },
        maxDistance: { value: 20.0 },
        falloff: { value: 0.65 },
        roughness: { value: 0.25 },
        distortion: { value: 0.12 },
        noiseAmount: { value: 0.08 },
        avatarXZ: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
      `,
      fragmentShader: /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
uniform sampler2D tCapture;
uniform float time;
uniform float enabled;
uniform float strength;
uniform float blur;
uniform float height;
uniform float fadeStart;
uniform float fadeEnd;
uniform float maxDistance;
uniform float falloff;
uniform float roughness;
uniform float distortion;
uniform float noiseAmount;
uniform vec2 avatarXZ;

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
  if (enabled < 0.5 || strength <= 0.0001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

  float s = mix(0.35, 0.95, 1.0 - height);
  uv.y = 0.5 + (uv.y - 0.5) * s;

  float n = noise(vUv * 6.0 + vec2(time * 0.10, time * 0.07));
  float na = clamp(noiseAmount, 0.0, 1.0);
  vec2 wobble = (n - 0.5) * (0.006 + 0.018 * distortion) * blur * na;

  float r = mix(0.0006, 0.0042, blur);
  vec3 echo = blur9(uv + wobble, r);

  float worldDist = distance(vWorld.xz, avatarXZ);
  float maxD = max(maxDistance, 0.0001);
  float endD = min(max(fadeEnd, fadeStart + 0.001), maxD);
  float fo = max(0.001, falloff);
  float mask = 1.0 - smoothstep(0.0, fo * maxD, worldDist);
  float fade = 1.0 - smoothstep(fadeStart, endD, worldDist);

  float rough = clamp(roughness, 0.0, 1.0);
  echo *= mix(1.0, 0.55, rough);

  float k = strength * mask * fade;
  vec3 outCol = echo * k;
  gl_FragColor = vec4(outCol, k);
}
      `,
    })

    m.toneMapped = false
    return m
  }, [tex])

  type AnyUniforms = Record<string, { value: unknown } | undefined>
  const setU = (uniforms: AnyUniforms | undefined, key: string, v: unknown) => {
    const u = uniforms?.[key]
    if (!u) return
    u.value = v
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const uniforms = echoMat.uniforms as AnyUniforms

    setU(uniforms, 'time', t)
    setU(uniforms, 'enabled', opt.reflection.reflectionEnabled ? 1 : 0)
    setU(uniforms, 'strength', 0.18 * opt.reflection.reflectionIntensity)
    setU(
      uniforms,
      'blur',
      THREE.MathUtils.clamp(
        opt.reflection.reflectionBlur + (1 - opt.reflection.reflectionSharpness) * 0.6,
        0,
        1,
      ),
    )
    setU(uniforms, 'height', 0.33)

    const radius = Math.max(0.001, opt.reflection.reflectionRadius ?? opt.reflection.reflectionMaxDistance)
    const fade = THREE.MathUtils.clamp(opt.reflection.reflectionFade ?? 0.9, 0, 1)
    const start = THREE.MathUtils.clamp(radius * (1 - fade), 0, radius - 0.001)

    setU(uniforms, 'fadeStart', Number.isFinite(start) ? start : opt.reflection.reflectionFadeStart)
    setU(uniforms, 'fadeEnd', radius)
    setU(uniforms, 'maxDistance', radius)
    setU(uniforms, 'falloff', opt.reflection.reflectionFalloff)

    setU(uniforms, 'roughness', opt.reflection.reflectionRoughness)
    setU(uniforms, 'distortion', opt.reflection.reflectionDistortion)
    setU(uniforms, 'noiseAmount', opt.reflection.reflectionNoiseAmount)

    const avatarXZ = uniforms.avatarXZ?.value
    if (avatarXZ && avatarXZ instanceof THREE.Vector2) avatarXZ.set(0, 0)

    if (reflectionMeshRef.current) {
      reflectionMeshRef.current.position.set(
        camera.position.x,
        opt.reflection.reflectionGroundY + 0.001,
        camera.position.z,
      )
    }
  })

  const extent = opt.reflection.reflectionExtent ?? 2000

  return (
    <mesh
      ref={reflectionMeshRef}
      frustumCulled={false}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[camera.position.x, opt.reflection.reflectionGroundY + 0.001, camera.position.z]}
      onUpdate={setEnvLayer}
    >
      <planeGeometry args={[extent, extent]} />
      <primitive object={echoMat} attach="material" />
    </mesh>
  )
}
