import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

export type HaloUniforms = {
  time: number
  arousal: number
  focus: number
  phaseBias: number
  mobiusR: number
  mobiusG: number
  mobiusB: number
  mobiusStrength: number
}

const HaloShellMaterial = shaderMaterial(
  {
    time: 0,
    arousal: 0,
    focus: 0,
    phaseBias: 0,
    mobiusR: 0,
    mobiusG: 0,
    mobiusB: 0,
    mobiusStrength: 0,
  } satisfies HaloUniforms,

  /* glsl */ `
    varying vec3 vPos;
    varying vec3 vN;
    varying vec3 vWPos;

    uniform float time;
    uniform float arousal;
    uniform float focus;
    uniform float phaseBias;

    uniform float mobiusR;
    uniform float mobiusG;
    uniform float mobiusB;
    uniform float mobiusStrength;

    float hash(vec3 p){
      p = fract(p*0.3183099 + vec3(0.1,0.2,0.3));
      p *= 17.0;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
    }

    float noise(vec3 p){
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f*f*(3.0-2.0*f);
      float n000 = hash(i+vec3(0,0,0));
      float n100 = hash(i+vec3(1,0,0));
      float n010 = hash(i+vec3(0,1,0));
      float n110 = hash(i+vec3(1,1,0));
      float n001 = hash(i+vec3(0,0,1));
      float n101 = hash(i+vec3(1,0,1));
      float n011 = hash(i+vec3(0,1,1));
      float n111 = hash(i+vec3(1,1,1));
      float nx00 = mix(n000,n100,f.x);
      float nx10 = mix(n010,n110,f.x);
      float nx01 = mix(n001,n101,f.x);
      float nx11 = mix(n011,n111,f.x);
      float nxy0 = mix(nx00,nx10,f.y);
      float nxy1 = mix(nx01,nx11,f.y);
      return mix(nxy0,nxy1,f.z);
    }

    void main(){
      vPos = position;
      vN = normalize(normalMatrix * normal);

      vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
      vWPos = wp;

      // Soft “smoke” displacement (bounded, emanates from surface)
      float t = time * (0.55 + 0.35 * arousal) + phaseBias;
      float n = noise(position * 2.1 + vec3(0.0, t*0.6, t*0.25)) - 0.5;
      float puff = n * (0.055 + 0.06 * arousal) * (0.65 + 0.35 * focus);

      vec3 displaced = position + normal * puff;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,

  /* glsl */ `
    varying vec3 vPos;
    varying vec3 vN;

    uniform float time;
    uniform float arousal;
    uniform float focus;
    uniform float phaseBias;

    uniform float mobiusR;
    uniform float mobiusG;
    uniform float mobiusB;
    uniform float mobiusStrength;

    // Scing hue family (blue/violet/magenta)
    vec3 scingBlue(){ return vec3(0.00, 0.78, 1.00); }
    vec3 scingViolet(){ return vec3(0.42, 0.10, 0.95); }
    vec3 scingMagenta(){ return vec3(1.00, 0.00, 0.76); }

    void main(){
      // Fresnel halo shell (emanates from avatar silhouette)
      vec3 N = normalize(vN);
      vec3 V = normalize(vec3(0.0, 0.0, 1.0));
      float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);

      float t = time * (0.7 + 0.5*arousal) + phaseBias;
      float pulse = 0.6 + 0.4 * (0.5 + 0.5 * sin(t));

      // Phase shift within Scing family (blue↔violet↔magenta)
      float ph = 0.5 + 0.5*sin(time*0.55 + vPos.y*1.3 + phaseBias);
      vec3 col = mix(scingBlue(), scingViolet(), smoothstep(0.15, 0.85, ph));
      col = mix(col, scingMagenta(), smoothstep(0.55, 0.95, ph));

      float ms = clamp(mobiusStrength, 0.0, 1.0);
      vec3 mob = vec3(mobiusR, mobiusG, mobiusB);
      col = mix(col, mob, ms);

      float alpha = fres * (0.14 + 0.22*arousal) * pulse * (0.75 + 0.25*focus);
      alpha *= (0.85 + 0.65 * ms);

      // Keep halo “soft smoke”, not a hard ring
      alpha *= smoothstep(0.0, 0.9, fres);

      gl_FragColor = vec4(col, alpha);
    }
  `,
)

export type HaloShellMaterialImpl = THREE.ShaderMaterial & {
  uniforms: Record<keyof HaloUniforms, { value: number }>
}
export { HaloShellMaterial }
