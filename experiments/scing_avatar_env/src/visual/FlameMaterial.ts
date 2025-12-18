import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

export type FlameUniforms = {
  time: number;
  arousal: number;
  entropy: number;
  valence: number;
  cognitiveLoad: number;
  rhythm: number;
  focus: number;
  layer: number; // 0 = inner core, 1 = outer skin
  specIntensity: number;
  veinIntensity: number;
  glassThickness: number;
  filamentStrength: number;
  metalness: number;
  roughness: number;
  highlightBoost: number;
  lightning: number;
  lightningSpeed: number;
  lightningWidth: number;
  gazeDir: THREE.Vector3;
  gazeStr: number;
  albedoTex: THREE.Texture | null;
  normalTex: THREE.Texture | null;
};

const FlameMaterial = shaderMaterial(
  {
    time: 0,
    arousal: 0,
    entropy: 0.04,
    valence: 0,
    cognitiveLoad: 0,
    rhythm: 0,
    focus: 0,
    layer: 0,
    specIntensity: 1.0,
    veinIntensity: 1.0,
    glassThickness: 0.55,
    filamentStrength: 0.45,
    metalness: 0.95,
    roughness: 0.18,
    highlightBoost: 1.25,
    lightning: 0.45,
    lightningSpeed: 0.85,
    lightningWidth: 0.55,
    gazeDir: new THREE.Vector3(0, 0, 1),
    gazeStr: 0.1,
    albedoTex: null,
    normalTex: null,
  } satisfies FlameUniforms,

  /* glsl */ `
  varying vec3 vPos;
  varying vec3 vN;
  varying vec3 vWPos;

  uniform float time;
  uniform float arousal;
  uniform float entropy;
  uniform float rhythm;
  uniform float focus;
  uniform float layer;
  uniform vec3 gazeDir;
  uniform float gazeStr;

  // --- deterministic hash/noise ---
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

  mat2 rot(float a){
    float s = sin(a), c = cos(a);
    return mat2(c,-s,s,c);
  }

  void main(){
    vPos = position;
    vN = normal;

    vec3 p = position;

    // Normalize vertical coordinate (assuming your mesh is roughly centered)
    float y = clamp(position.y * 0.8 + 0.5, 0.0, 1.0);

    // Phase-lag: outer skin reacts slightly later than core
    float t = time - (layer > 0.5 ? 0.09 : 0.0);

    // Stable left/right axis relative to gaze (for asymmetry)
    vec3 g = normalize(gazeDir);
    vec3 rightAxis = normalize(cross(vec3(0.0, 1.0, 0.0), g) + vec3(1e-4, 0.0, 0.0));
    float side = clamp(dot(normalize(p), rightAxis), -1.0, 1.0);
    float lead = side * gazeStr; // one side leads, the other follows (bounded)

    // 1) BREATH + PINCH (major silhouette control)
    float breathe = sin(t * 0.55) * 0.065 * (0.6 + arousal);
    float pinch = -0.08 * (1.0 - smoothstep(0.15, 0.55, y)) * (0.65 + 0.35*focus);

    // 2) TORSION TWIST (stronger near top)
    float twist = (0.6 + 0.9*arousal) * (y*y) * sin((t + lead*0.22)*0.55 + y*2.2);
    p.xz = rot(twist) * p.xz;

    // 3) TIP WHIP + HOOK (top tendril curl)
    float tipMask = smoothstep(0.60, 0.98, y);
    float hook = tipMask * (0.22 + 0.25*arousal) * sin((t + lead*0.18)*0.9 + y*3.0);
    p.x += hook * (0.65 + 0.35*sin(t*0.6));
    p.z += hook * (0.55 + 0.45*cos(t*0.7));

    // 4) FLOWING DEFORMATION (curl/noise lanes)
    float n1 = (noise(p*1.7 + (t + lead*0.28)*0.35) - 0.5);
    float n2 = (noise(p*3.7 + (t + lead*0.28)*1.15) - 0.5);
    float curl = n1 * (0.10 + 0.10*arousal);
    float jitter = n2 * entropy * 0.08;

    // 5) Apply bounded displacement (identity preserved)
    float disp = breathe + pinch + curl + jitter;
    vec3 displaced = p + normal * disp;

    // Focus adds directional bias, NOT stabilization
    float focusBias = (focus - 0.5) * 0.04;
    displaced += normalize(position) * focusBias;

    // Focus → GAZE DIRECTION (energy leans toward gaze)
    displaced += g * (gazeStr * (0.25 + 0.35 * arousal));

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWPos = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
  `,

  /* glsl */ `
varying vec3 vPos;
varying vec3 vN;

uniform float time;
uniform float arousal;
uniform float entropy;
uniform float valence;
uniform float cognitiveLoad;
uniform float rhythm;
uniform float focus;
uniform float layer;

uniform float specIntensity;
uniform float veinIntensity;
uniform float glassThickness;
uniform float filamentStrength;

uniform float metalness;
uniform float roughness;
uniform float highlightBoost;
uniform float lightning;
uniform float lightningSpeed;
uniform float lightningWidth;

// --- helpers ---
float sat(float x){ return clamp(x, 0.0, 1.0); }
vec3 sat3(vec3 c){ return clamp(c, vec3(0.0), vec3(1.0)); }

float hash(vec3 p){
p = fract(p*0.3183099 + vec3(0.1,0.2,0.3));
p *= 17.0;
return fract(p.x*p.y*p.z*(p.x+p.y*p.z));
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

// two canonical neon accents (used sparingly)
vec3 neonCyan(){ return vec3(0.00, 0.85, 1.00); }
vec3 neonMagenta(){ return vec3(1.00, 0.00, 0.85); }
vec3 violetShear(){ return vec3(0.55, 0.10, 0.95); }

void main(){
vec3 N = normalize(vN);
vec3 V = normalize(vec3(0.0, 0.0, 1.0)); // stable view proxy for consistent chrome
float ndv = sat(dot(N, V));


// --- liquid metal normal micro-structure (subtle; keeps chrome alive) ---
float micro = noise(vPos * 6.0 + time * 0.35);
float micro2 = noise(vPos * 12.0 - time * 0.22);
float microMix = (micro * 0.6 + micro2 * 0.4);
float microAmp = mix(0.02, 0.06, sat(arousal * 0.9 + focus * 0.4));
vec3 Nm = normalize(N + (microMix - 0.5) * microAmp);

// --- fresnel (chrome edge lift, NOT emissive) ---
float fresPow = mix(6.0, 3.0, sat(glassThickness));
float fres = pow(1.0 - sat(dot(Nm, V)), fresPow);
float edgeLift = mix(0.10, 0.35, fres);

// --- specular highlights (fixed “studio” lights, avatar-only) ---
vec3 L1 = normalize(vec3( 0.55, 0.65, 0.55));
vec3 L2 = normalize(vec3(-0.70, 0.25, 0.65));
vec3 L3 = normalize(vec3( 0.10, 0.95,-0.25));

vec3 H1 = normalize(L1 + V);
vec3 H2 = normalize(L2 + V);
vec3 H3 = normalize(L3 + V);

float r = clamp(roughness, 0.05, 0.65);
float shin = mix(220.0, 55.0, r); // lower roughness -> sharper
float s1 = pow(sat(dot(Nm, H1)), shin);
float s2 = pow(sat(dot(Nm, H2)), shin * 0.85);
float s3 = pow(sat(dot(Nm, H3)), shin * 0.65);

float spec = (s1 * 1.00 + s2 * 0.70 + s3 * 0.55);
spec *= highlightBoost;
spec *= clamp(specIntensity, 0.0, 2.0);
spec *= mix(0.65, 1.25, sat(arousal + focus * 0.6)); // reacts to voice/focus

// --- dark chrome base (NOT lit up) ---
vec3 chromeBase = vec3(0.035, 0.038, 0.045); // near-black metal
vec3 steelTint  = vec3(0.11, 0.12, 0.14);    // subtle lift in highlights

float metal = clamp(metalness, 0.75, 1.0);
vec3 base = mix(chromeBase, steelTint, edgeLift * 0.55);

// --- color advection (used only as “oil-slick” accent, very restrained) ---
float flow = 0.5 + 0.5 * sin(time + vPos.y * 3.0);
vec3 accent = mix(neonCyan(), neonMagenta(), flow);
accent += violetShear() * (0.15 * sat(valence * 0.5 + 0.5));
float vein = clamp(veinIntensity, 0.0, 2.0);
float accentAmt = (0.05 + 0.09 * sat(arousal * 0.7)) * mix(0.6, 1.4, vein * 0.5); // still restrained
base += accent * accentAmt;

// --- lightning filaments (selective emissive; strongest on core layer) ---
// filament field: thin bands that advect + jitter deterministically
float adv = time * (0.85 + lightningSpeed) + vPos.y * (5.5 + rhythm * 3.0);
float f1 = noise(vPos * 3.5 + vec3(adv, adv*0.6, adv*0.4));
float f2 = noise(vPos * 7.5 + vec3(-adv*0.4, adv*0.9, adv));
float filament = abs(f1 - f2);        // sharp ridges
filament = pow(sat(filament), 5.0);   // thin lines
filament *= (0.6 + 0.8 * sat(arousal)); // voice-driven
filament *= clamp(lightningWidth, 0.35, 0.95);

// layer: 0=core, 1=skin
float layerGain = (layer < 0.5) ? 1.0 : 0.55;
float emissGain = lightning * layerGain;
emissGain *= clamp(filamentStrength, 0.0, 1.0);

vec3 emissive = accent * filament * emissGain;

// --- final shading ---
// keep base dark; add spec as reflective highlight (not bloom-only)
vec3 color = base + (vec3(1.0) * spec * metal);

// rim lift (subtle, still not “fully lit”)
float rim = pow(1.0 - sat(dot(Nm, V)), 2.2);
color += rim * 0.08 * (0.6 + focus * 0.6) * mix(0.9, 1.15, sat(glassThickness));

// add emissive filaments (these are what bloom should catch)
color += emissive;

// clamp (prevents overblown “fully lit” look)
color = min(color, vec3(1.25));

gl_FragColor = vec4(color, 1.0);

}
  `
);

export type FlameMaterialImpl =
  THREE.ShaderMaterial & {
    uniforms: Record<keyof FlameUniforms, { value: number | THREE.Texture | THREE.Vector3 | null }>
  };

export { FlameMaterial };
