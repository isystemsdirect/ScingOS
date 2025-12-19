import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import { useAvatarReflectionCapture } from './AvatarReflectionCapture'
import { LAYER_ENV } from './layers'

export default function Floor(props: { floorY: number; size?: number }) {
  const opt = useDevOptionsStore()
  const { camera } = useThree()
  const size = props.size ?? 18

  const reflectionMeshRef = useRef<THREE.Mesh>(null)

  const setEnvLayer = (o: THREE.Object3D) => {
    o.layers.set(LAYER_ENV)
  }

  // Avatar-only capture (mirror cam renders avatar layer only)
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
        roughness: { value: 0.25 },
        distortion: { value: 0.12 },
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
uniform float roughness;
uniform float distortion;
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
  // Keep reflection independent from the cosmetic floor.
  // When disabled/intensity=0, render fully transparent.
  if (enabled < 0.5 || strength <= 0.0001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // avatar-only mirror read
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

  // Height proxy: higher hover -> tighter, dimmer reflection
  float s = mix(0.35, 0.95, 1.0 - height);
  uv.y = 0.5 + (uv.y - 0.5) * s;

  // organic smear (deterministic)
  float n = noise(vUv * 6.0 + vec2(time * 0.10, time * 0.07));
  vec2 wobble = (n - 0.5) * (0.006 + 0.018 * distortion) * blur;

  float r = mix(0.0006, 0.0042, blur);
  vec3 echo = blur9(uv + wobble, r);

  // World-space falloff around avatar position (prevents drift when plane recenters).
  float worldDist = distance(vWorld.xz, avatarXZ);
  float maxD = max(maxDistance, 0.0001);
  float endD = min(max(fadeEnd, fadeStart + 0.001), maxD);
  float mask = 1.0 - smoothstep(0.0, 0.65 * maxD, worldDist);
  float fade = 1.0 - smoothstep(fadeStart, endD, worldDist);

  // Roughness makes the reflection less direct.
  float rough = clamp(roughness, 0.0, 1.0);
  echo *= mix(1.0, 0.55, rough);

  // subtle, organic mirror (never dominant)
  float k = strength * mask * fade;
  vec3 outCol = echo * k;
  gl_FragColor = vec4(outCol, k);
}
      `,
    })

    m.toneMapped = false
    return m
  }, [tex])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    echoMat.uniforms.time.value = t
    echoMat.uniforms.enabled.value = opt.reflection.reflectionEnabled ? 1 : 0
    // Keep legacy scale (~0.18) but make intensity user-controlled.
    echoMat.uniforms.strength.value = 0.18 * opt.reflection.reflectionIntensity
    // Map blur/sharpness explicitly.
    echoMat.uniforms.blur.value = THREE.MathUtils.clamp(opt.reflection.reflectionBlur + (1 - opt.reflection.reflectionSharpness) * 0.6, 0, 1)
    echoMat.uniforms.height.value = 0.33
    echoMat.uniforms.fadeStart.value = opt.reflection.reflectionFadeStart
    echoMat.uniforms.fadeEnd.value = Math.max(opt.reflection.reflectionFadeEnd, opt.reflection.reflectionFadeStart + 0.001)
    echoMat.uniforms.maxDistance.value = opt.reflection.reflectionMaxDistance
    echoMat.uniforms.roughness.value = opt.reflection.reflectionRoughness
    echoMat.uniforms.distortion.value = opt.reflection.reflectionDistortion

    // Avatar is currently centered in Scene3D; keep as a uniform for future motion.
    ;(echoMat.uniforms.avatarXZ.value as THREE.Vector2).set(0, 0)

    // "Infinite practical plane": huge, always mounted, camera-centered.
    if (reflectionMeshRef.current) {
      reflectionMeshRef.current.position.set(camera.position.x, opt.reflection.reflectionGroundY + 0.001, camera.position.z)
    }
  })

  return (
    <group>
      {/* Cosmetic floor mesh (can be hidden independently from reflection). */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, opt.floor.floorY, 0]}
        onUpdate={setEnvLayer}
        receiveShadow
        visible={opt.floor.floorVisible}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={'#05020b'} roughness={0.92} metalness={0.0} />
      </mesh>

      {/* Infinite reflection plane: huge, camera-centered, always mounted when enabled. */}
      <mesh
        ref={reflectionMeshRef}
        frustumCulled={false}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[camera.position.x, opt.reflection.reflectionGroundY + 0.001, camera.position.z]}
        onUpdate={setEnvLayer}
      >
        <planeGeometry args={[2000, 2000]} />
        <primitive object={echoMat} attach="material" />
      </mesh>
    </group>
  )
}
