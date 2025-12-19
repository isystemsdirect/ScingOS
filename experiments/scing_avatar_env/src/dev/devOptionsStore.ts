export type Vec3 = readonly [number, number, number]

export type ReflectionResolution = 256 | 512 | 1024 | 2048
export type LightRotationAxis = 'x' | 'y' | 'z'

export type LightRigSpot = {
  enabled: boolean
  color: string // #RRGGBB
  intensity: number
  distance: number
  decay: number
  angle: number
  penumbra: number
  position: Vec3
  target: Vec3
  castShadow: boolean
  layerAvatarOnly: boolean
  rotationEnabled: boolean
  rotationAxis: LightRotationAxis
  rotationRate: number // rad/sec
  radiusHint: number
}

export type DevOptions = {
  ui: {
    hudVisible: boolean
    devPanelVisible: boolean
    devPanelDock: 'left' | 'right'
    panelsMaxWidthPct: number
    safeMode: boolean
  }

  avatar: {
    enabled: boolean
    meshVisible: boolean
    wireframeVisible: boolean
    haloEnabled: boolean
    flaresEnabled: boolean
    trailsEnabled: boolean
    starfieldEnabled: boolean
    debugNormals: boolean
    debugUV: boolean
    debugBounds: boolean
  }

  // A) Floor + Reflection (full control)
  floor: {
    floorVisible: boolean // cosmetic only
    floorY: number
    floorInfinite: true
  }

  reflection: {
    reflectionEnabled: boolean
    reflectionIntensity: number
    reflectionMaxDistance: number
    reflectionResolution: ReflectionResolution
    reflectionBlur: number
    reflectionSharpness: number
    reflectionRoughness: number
    reflectionDistortion: number
    reflectionNormalStrength: number
    reflectionFadeStart: number
    reflectionFadeEnd: number
    reflectionGroundY: number
    reflectionClipBias: number
  }

  // B) Light Rig (4 spots)
  lights: {
    enabled: boolean
    ambientEnabled: boolean
    ambientIntensity: number
    spots: [LightRigSpot, LightRigSpot, LightRigSpot, LightRigSpot]
  }

  // C) Floor shine (condensed hotspot)
  floorShine: {
    floorShineEnabled: boolean
    floorShineRadius: number
    floorShineIntensity: number
    floorShineFalloff: number
    floorShineFollowAvatar: boolean
  }

  // Post/perf are kept for UI completeness (even if unused in rendering yet).
  post: {
    enabled: boolean
    exposure: number
    gamma: number
    bloomEnabled: boolean
    bloomStrength: number
    vignetteEnabled: boolean
    vignetteStrength: number
  }

  perf: {
    dpr: number
    antialias: boolean
    shadows: boolean
    powerPreference: 'low-power' | 'high-performance'
  }

  // Keep legacy groups that other parts of the emulator already rely on.
  material: {
    profile: string
    chromeLevel: number
    roughness: number
    metalness: number
    emissiveGain: number
    rimGain: number
    microDetailGain: number
    microDetailScale: number
    lightningEnabled: boolean
    lightningRate: number
    lightningIntensity: number
    colorPhaseMode: string
    phaseBias: number
    paletteA: string
    paletteB: string
    paletteC: string
    paletteMix: number
  }

  motion: {
    enabled: boolean
    breatheAmp: number
    breatheRate: number
    curlAmp: number
    curlRate: number
    torsionAmp: number
    torsionRate: number
    jitterAmp: number
    identityClamp: number
    smoothing: number
    deterministicEntropyEnabled: boolean
    entropyMin: number
    entropyMax: number
  }

  state: {
    source: string
    overrideEnabled: boolean
    arousal: number
    valence: number
    cognitiveLoad: number
    rhythm: number
    entropy: number
    focus: number
  }

  sensors: {
    mic: {
      enabled: boolean
      autoSuspendWhenOff: boolean
      gain: number
      pitchDetect: boolean
      noiseGate: number
      debugHUD: boolean
    }
    cam: {
      enabled: boolean
      autoSuspendWhenOff: boolean
      motionSensitivity: number
      downscale: number
      debugHUD: boolean
    }
    sim: {
      enabled: boolean
      mode: string
      intensity: number
    }
  }

  chroma: {
    enabled: boolean
    adapter: string
    device: string
    updateHz: number
    intensity: number
    phaseBias: number
    map: {
      arousal: string
      focus: string
      valence: string
    }
    previewRGB: boolean
  }

  log: {
    level: string
    sensorStream: boolean
    stateStream: boolean
    renderHealth: boolean
  }

  security: {
    baneSim: {
      enabled: boolean
      denyLighting: boolean
      denyMic: boolean
      denyCam: boolean
    }
    auditTrailVisible: boolean
  }
}

type Listener = () => void

const LS_KEY = 'scing_avatar_env_dev_options_v2_full_control'

function clamp(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min
  if (v < min) return min
  if (v > max) return max
  return v
}

function clamp01(v: number) {
  return clamp(v, 0, 1)
}

function clampHex(v: unknown, fallback: string) {
  if (typeof v !== 'string') return fallback
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback
}

function vec3(v: unknown, fallback: Vec3): Vec3 {
  if (!Array.isArray(v) || v.length !== 3) return fallback
  const a = Number(v[0])
  const b = Number(v[1])
  const c = Number(v[2])
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return fallback
  return [a, b, c]
}

function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}

function safeParse(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function safeWrite(value: unknown) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

function defaultSpot(i: number): LightRigSpot {
  const presets = [
    { color: '#ffd59a', pos: [3.8, 2.6, 2.8] as Vec3, tgt: [0, 1.0, 0] as Vec3 },
    { color: '#7a3cff', pos: [-4.2, 3.1, -1.8] as Vec3, tgt: [0, 1.0, 0] as Vec3 },
    { color: '#ff2ea6', pos: [-1.2, 1.9, 4.4] as Vec3, tgt: [0, 1.0, 0] as Vec3 },
    { color: '#f3f7ff', pos: [1.6, 4.6, -4.6] as Vec3, tgt: [0, 1.0, 0] as Vec3 },
  ] as const

  const p = presets[i] ?? presets[0]

  return {
    enabled: true,
    color: p.color,
    intensity: i === 0 ? 45 : i === 1 ? 32 : i === 2 ? 28 : 10,
    distance: i === 2 ? 16 : 18,
    decay: 2,
    angle: i === 0 ? 0.42 : i === 1 ? 0.48 : i === 2 ? 0.5 : 0.55,
    penumbra: i === 0 ? 0.85 : i === 3 ? 1.0 : 0.95,
    position: p.pos,
    target: p.tgt,
    castShadow: false,
    layerAvatarOnly: true,
    rotationEnabled: false,
    rotationAxis: 'y',
    rotationRate: 0.6,
    radiusHint: 0.65,
  }
}

export const DEV_OPTIONS_DEFAULTS: DevOptions = {
  ui: {
    hudVisible: true,
    devPanelVisible: true,
    devPanelDock: 'right',
    panelsMaxWidthPct: 20,
    safeMode: false,
  },

  avatar: {
    enabled: true,
    meshVisible: false,
    wireframeVisible: false,
    haloEnabled: true,
    flaresEnabled: true,
    trailsEnabled: false,
    starfieldEnabled: true,
    debugNormals: false,
    debugUV: false,
    debugBounds: false,
  },

  floor: {
    floorVisible: true,
    floorY: 0,
    floorInfinite: true,
  },

  reflection: {
    reflectionEnabled: true,
    reflectionIntensity: 1.0,
    reflectionMaxDistance: 20,
    reflectionResolution: 1024,
    reflectionBlur: 0.2,
    reflectionSharpness: 0.7,
    reflectionRoughness: 0.25,
    reflectionDistortion: 0.12,
    reflectionNormalStrength: 0.35,
    reflectionFadeStart: 0,
    reflectionFadeEnd: 18,
    reflectionGroundY: 0,
    reflectionClipBias: 0.0,
  },

  lights: {
    enabled: true,
    ambientEnabled: true,
    ambientIntensity: 0.06,
    spots: [defaultSpot(0), defaultSpot(1), defaultSpot(2), defaultSpot(3)],
  },

  floorShine: {
    floorShineEnabled: true,
    floorShineRadius: 0.28,
    floorShineIntensity: 0.85,
    floorShineFalloff: 3.2,
    floorShineFollowAvatar: true,
  },

  post: {
    enabled: false,
    exposure: 1.0,
    gamma: 1.0,
    bloomEnabled: false,
    bloomStrength: 0.6,
    vignetteEnabled: false,
    vignetteStrength: 0.35,
  },

  perf: {
    dpr: 1,
    antialias: false,
    shadows: false,
    powerPreference: 'low-power',
  },

  // Existing canonical-like groups (kept so nothing disappears)
  material: {
    profile: 'SpectraFlame_DarkV2_0',
    chromeLevel: 0.6,
    roughness: 0.25,
    metalness: 0.85,
    emissiveGain: 1.0,
    rimGain: 1.0,
    microDetailGain: 0.8,
    microDetailScale: 1.0,
    lightningEnabled: true,
    lightningRate: 1.0,
    lightningIntensity: 1.0,
    colorPhaseMode: 'SCING',
    phaseBias: 0.37,
    paletteA: '#9a6bff',
    paletteB: '#4fe3ff',
    paletteC: '#ff2ea6',
    paletteMix: 0.5,
  },

  motion: {
    enabled: true,
    breatheAmp: 0.06,
    breatheRate: 0.9,
    curlAmp: 0.1,
    curlRate: 1.2,
    torsionAmp: 0.1,
    torsionRate: 1.0,
    jitterAmp: 0.02,
    identityClamp: 0.65,
    smoothing: 8,
    deterministicEntropyEnabled: true,
    entropyMin: 0.03,
    entropyMax: 0.06,
  },

  state: {
    source: 'liveSensors',
    overrideEnabled: false,
    arousal: 0.25,
    valence: 0.0,
    cognitiveLoad: 0.25,
    rhythm: 0.25,
    entropy: 0.04,
    focus: 0.55,
  },

  sensors: {
    mic: {
      enabled: true,
      autoSuspendWhenOff: true,
      gain: 1.0,
      pitchDetect: true,
      noiseGate: 0.15,
      debugHUD: false,
    },
    cam: {
      enabled: false,
      autoSuspendWhenOff: true,
      motionSensitivity: 1.0,
      downscale: 0.75,
      debugHUD: false,
    },
    sim: {
      enabled: false,
      mode: 'idle',
      intensity: 0.5,
    },
  },

  chroma: {
    enabled: false,
    adapter: 'OpenRGB',
    device: '',
    updateHz: 30,
    intensity: 0.6,
    phaseBias: 0,
    map: {
      arousal: 'R',
      focus: 'G',
      valence: 'B',
    },
    previewRGB: false,
  },

  log: {
    level: 'warn',
    sensorStream: false,
    stateStream: false,
    renderHealth: false,
  },

  security: {
    baneSim: {
      enabled: false,
      denyLighting: false,
      denyMic: false,
      denyCam: false,
    },
    auditTrailVisible: false,
  },
}

function normalizeSpot(src: any, fallback: LightRigSpot): LightRigSpot {
  const s = src && typeof src === 'object' ? src : {}
  return {
    enabled: s.enabled === undefined ? fallback.enabled : !!s.enabled,
    color: clampHex(s.color, fallback.color),
    intensity: clamp(Number(s.intensity ?? fallback.intensity), 0, 100),
    distance: clamp(Number(s.distance ?? fallback.distance), 0, 5000),
    decay: clamp(Number(s.decay ?? fallback.decay), 0, 4),
    angle: clamp(Number(s.angle ?? fallback.angle), 0.01, Math.PI / 2),
    penumbra: clamp01(Number(s.penumbra ?? fallback.penumbra)),
    position: vec3(s.position, fallback.position),
    target: vec3(s.target, fallback.target),
    castShadow: !!s.castShadow,
    layerAvatarOnly: s.layerAvatarOnly === undefined ? fallback.layerAvatarOnly : !!s.layerAvatarOnly,
    rotationEnabled: !!s.rotationEnabled,
    rotationAxis: pick(s.rotationAxis, ['x', 'y', 'z'] as const, fallback.rotationAxis),
    rotationRate: clamp(Number(s.rotationRate ?? fallback.rotationRate), -10, 10),
    radiusHint: clamp(Number(s.radiusHint ?? fallback.radiusHint), 0.05, 3),
  }
}

export function normalizeDevOptions(input: unknown): DevOptions {
  const src = input && typeof input === 'object' ? (input as any) : {}

  const ui = src.ui && typeof src.ui === 'object' ? src.ui : {}
  const avatar = src.avatar && typeof src.avatar === 'object' ? src.avatar : {}
  const floor = src.floor && typeof src.floor === 'object' ? src.floor : {}
  const reflection = src.reflection && typeof src.reflection === 'object' ? src.reflection : {}
  const lights = src.lights && typeof src.lights === 'object' ? src.lights : {}
  const floorShine = src.floorShine && typeof src.floorShine === 'object' ? src.floorShine : {}
  const post = src.post && typeof src.post === 'object' ? src.post : {}
  const perf = src.perf && typeof src.perf === 'object' ? src.perf : {}

  const material = src.material && typeof src.material === 'object' ? src.material : {}
  const motion = src.motion && typeof src.motion === 'object' ? src.motion : {}
  const state = src.state && typeof src.state === 'object' ? src.state : {}
  const sensors = src.sensors && typeof src.sensors === 'object' ? src.sensors : {}
  const chroma = src.chroma && typeof src.chroma === 'object' ? src.chroma : {}
  const log = src.log && typeof src.log === 'object' ? src.log : {}
  const security = src.security && typeof src.security === 'object' ? src.security : {}

  const mic = sensors.mic && typeof sensors.mic === 'object' ? sensors.mic : {}
  const cam = sensors.cam && typeof sensors.cam === 'object' ? sensors.cam : {}
  const sim = sensors.sim && typeof sensors.sim === 'object' ? sensors.sim : {}

  const spotsSrc = Array.isArray(lights.spots) ? lights.spots : []
  const spotsFallback = DEV_OPTIONS_DEFAULTS.lights.spots
  const spots: [LightRigSpot, LightRigSpot, LightRigSpot, LightRigSpot] = [
    normalizeSpot(spotsSrc[0], spotsFallback[0]),
    normalizeSpot(spotsSrc[1], spotsFallback[1]),
    normalizeSpot(spotsSrc[2], spotsFallback[2]),
    normalizeSpot(spotsSrc[3], spotsFallback[3]),
  ]

  const groundY = Number.isFinite(reflection.reflectionGroundY) ? Number(reflection.reflectionGroundY) : Number(floor.floorY)
  const floorY = Number.isFinite(floor.floorY) ? Number(floor.floorY) : (Number.isFinite(groundY) ? Number(groundY) : DEV_OPTIONS_DEFAULTS.floor.floorY)

  const res = Number(reflection.reflectionResolution)
  const reflectionResolution: ReflectionResolution = ([256, 512, 1024, 2048] as const).includes(res as any)
    ? (res as ReflectionResolution)
    : DEV_OPTIONS_DEFAULTS.reflection.reflectionResolution

  return {
    ui: {
      hudVisible: ui.hudVisible === undefined ? DEV_OPTIONS_DEFAULTS.ui.hudVisible : !!ui.hudVisible,
      devPanelVisible: ui.devPanelVisible === undefined ? DEV_OPTIONS_DEFAULTS.ui.devPanelVisible : !!ui.devPanelVisible,
      devPanelDock: pick(ui.devPanelDock, ['left', 'right'] as const, DEV_OPTIONS_DEFAULTS.ui.devPanelDock),
      panelsMaxWidthPct: clamp(Number(ui.panelsMaxWidthPct ?? DEV_OPTIONS_DEFAULTS.ui.panelsMaxWidthPct), 0, 100),
      safeMode: !!ui.safeMode,
    },

    avatar: {
      enabled: avatar.enabled === undefined ? DEV_OPTIONS_DEFAULTS.avatar.enabled : !!avatar.enabled,
      meshVisible: avatar.meshVisible === undefined ? DEV_OPTIONS_DEFAULTS.avatar.meshVisible : !!avatar.meshVisible,
      wireframeVisible: !!avatar.wireframeVisible,
      haloEnabled: avatar.haloEnabled === undefined ? DEV_OPTIONS_DEFAULTS.avatar.haloEnabled : !!avatar.haloEnabled,
      flaresEnabled: avatar.flaresEnabled === undefined ? DEV_OPTIONS_DEFAULTS.avatar.flaresEnabled : !!avatar.flaresEnabled,
      trailsEnabled: !!avatar.trailsEnabled,
      starfieldEnabled: avatar.starfieldEnabled === undefined ? DEV_OPTIONS_DEFAULTS.avatar.starfieldEnabled : !!avatar.starfieldEnabled,
      debugNormals: !!avatar.debugNormals,
      debugUV: !!avatar.debugUV,
      debugBounds: !!avatar.debugBounds,
    },

    floor: {
      floorVisible: floor.floorVisible === undefined ? DEV_OPTIONS_DEFAULTS.floor.floorVisible : !!floor.floorVisible,
      floorY,
      floorInfinite: true,
    },

    reflection: {
      reflectionEnabled:
        reflection.reflectionEnabled === undefined ? DEV_OPTIONS_DEFAULTS.reflection.reflectionEnabled : !!reflection.reflectionEnabled,
      reflectionIntensity: clamp(Number(reflection.reflectionIntensity ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionIntensity), 0, 5),
      reflectionMaxDistance: clamp(Number(reflection.reflectionMaxDistance ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionMaxDistance), 0, 5000),
      reflectionResolution,
      reflectionBlur: clamp01(Number(reflection.reflectionBlur ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionBlur)),
      reflectionSharpness: clamp01(Number(reflection.reflectionSharpness ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionSharpness)),
      reflectionRoughness: clamp01(Number(reflection.reflectionRoughness ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionRoughness)),
      reflectionDistortion: clamp01(Number(reflection.reflectionDistortion ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionDistortion)),
      reflectionNormalStrength: clamp(Number(reflection.reflectionNormalStrength ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionNormalStrength), 0, 2),
      reflectionFadeStart: clamp(Number(reflection.reflectionFadeStart ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionFadeStart), 0, 5000),
      reflectionFadeEnd: clamp(Number(reflection.reflectionFadeEnd ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionFadeEnd), 0, 5000),
      reflectionGroundY: floorY,
      reflectionClipBias: clamp(Number(reflection.reflectionClipBias ?? DEV_OPTIONS_DEFAULTS.reflection.reflectionClipBias), -0.05, 0.05),
    },

    lights: {
      enabled: lights.enabled === undefined ? DEV_OPTIONS_DEFAULTS.lights.enabled : !!lights.enabled,
      ambientEnabled: lights.ambientEnabled === undefined ? DEV_OPTIONS_DEFAULTS.lights.ambientEnabled : !!lights.ambientEnabled,
      ambientIntensity: clamp(Number(lights.ambientIntensity ?? DEV_OPTIONS_DEFAULTS.lights.ambientIntensity), 0, 2),
      spots,
    },

    floorShine: {
      floorShineEnabled:
        floorShine.floorShineEnabled === undefined ? DEV_OPTIONS_DEFAULTS.floorShine.floorShineEnabled : !!floorShine.floorShineEnabled,
      floorShineRadius: clamp(Number(floorShine.floorShineRadius ?? DEV_OPTIONS_DEFAULTS.floorShine.floorShineRadius), 0.02, 10),
      floorShineIntensity: clamp(Number(floorShine.floorShineIntensity ?? DEV_OPTIONS_DEFAULTS.floorShine.floorShineIntensity), 0, 5),
      floorShineFalloff: clamp(Number(floorShine.floorShineFalloff ?? DEV_OPTIONS_DEFAULTS.floorShine.floorShineFalloff), 0.1, 20),
      floorShineFollowAvatar:
        floorShine.floorShineFollowAvatar === undefined
          ? DEV_OPTIONS_DEFAULTS.floorShine.floorShineFollowAvatar
          : !!floorShine.floorShineFollowAvatar,
    },

    post: {
      enabled: !!post.enabled,
      exposure: clamp(Number(post.exposure ?? DEV_OPTIONS_DEFAULTS.post.exposure), 0.1, 3),
      gamma: clamp(Number(post.gamma ?? DEV_OPTIONS_DEFAULTS.post.gamma), 0.1, 3),
      bloomEnabled: !!post.bloomEnabled,
      bloomStrength: clamp(Number(post.bloomStrength ?? DEV_OPTIONS_DEFAULTS.post.bloomStrength), 0, 3),
      vignetteEnabled: !!post.vignetteEnabled,
      vignetteStrength: clamp01(Number(post.vignetteStrength ?? DEV_OPTIONS_DEFAULTS.post.vignetteStrength)),
    },

    perf: {
      dpr: clamp(Number(perf.dpr ?? DEV_OPTIONS_DEFAULTS.perf.dpr), 0.5, 3),
      antialias: perf.antialias === undefined ? DEV_OPTIONS_DEFAULTS.perf.antialias : !!perf.antialias,
      shadows: perf.shadows === undefined ? DEV_OPTIONS_DEFAULTS.perf.shadows : !!perf.shadows,
      powerPreference: pick(perf.powerPreference, ['low-power', 'high-performance'] as const, DEV_OPTIONS_DEFAULTS.perf.powerPreference),
    },

    material: {
      profile: typeof material.profile === 'string' ? material.profile : DEV_OPTIONS_DEFAULTS.material.profile,
      chromeLevel: clamp(Number(material.chromeLevel ?? DEV_OPTIONS_DEFAULTS.material.chromeLevel), 0, 1),
      roughness: clamp01(Number(material.roughness ?? DEV_OPTIONS_DEFAULTS.material.roughness)),
      metalness: clamp01(Number(material.metalness ?? DEV_OPTIONS_DEFAULTS.material.metalness)),
      emissiveGain: clamp(Number(material.emissiveGain ?? DEV_OPTIONS_DEFAULTS.material.emissiveGain), 0, 2),
      rimGain: clamp(Number(material.rimGain ?? DEV_OPTIONS_DEFAULTS.material.rimGain), 0, 2),
      microDetailGain: clamp(Number(material.microDetailGain ?? DEV_OPTIONS_DEFAULTS.material.microDetailGain), 0, 2),
      microDetailScale: clamp(Number(material.microDetailScale ?? DEV_OPTIONS_DEFAULTS.material.microDetailScale), 0.25, 8),
      lightningEnabled:
        material.lightningEnabled === undefined ? DEV_OPTIONS_DEFAULTS.material.lightningEnabled : !!material.lightningEnabled,
      lightningRate: clamp(Number(material.lightningRate ?? DEV_OPTIONS_DEFAULTS.material.lightningRate), 0, 3),
      lightningIntensity: clamp(Number(material.lightningIntensity ?? DEV_OPTIONS_DEFAULTS.material.lightningIntensity), 0, 2),
      colorPhaseMode: typeof material.colorPhaseMode === 'string' ? material.colorPhaseMode : DEV_OPTIONS_DEFAULTS.material.colorPhaseMode,
      phaseBias: Number.isFinite(material.phaseBias) ? Number(material.phaseBias) : DEV_OPTIONS_DEFAULTS.material.phaseBias,
      paletteA: clampHex(material.paletteA, DEV_OPTIONS_DEFAULTS.material.paletteA),
      paletteB: clampHex(material.paletteB, DEV_OPTIONS_DEFAULTS.material.paletteB),
      paletteC: clampHex(material.paletteC, DEV_OPTIONS_DEFAULTS.material.paletteC),
      paletteMix: clamp01(Number(material.paletteMix ?? DEV_OPTIONS_DEFAULTS.material.paletteMix)),
    },

    motion: {
      enabled: motion.enabled === undefined ? DEV_OPTIONS_DEFAULTS.motion.enabled : !!motion.enabled,
      breatheAmp: clamp(Number(motion.breatheAmp ?? DEV_OPTIONS_DEFAULTS.motion.breatheAmp), 0, 0.2),
      breatheRate: clamp(Number(motion.breatheRate ?? DEV_OPTIONS_DEFAULTS.motion.breatheRate), 0, 2),
      curlAmp: clamp(Number(motion.curlAmp ?? DEV_OPTIONS_DEFAULTS.motion.curlAmp), 0, 0.25),
      curlRate: clamp(Number(motion.curlRate ?? DEV_OPTIONS_DEFAULTS.motion.curlRate), 0, 3),
      torsionAmp: clamp(Number(motion.torsionAmp ?? DEV_OPTIONS_DEFAULTS.motion.torsionAmp), 0, 0.3),
      torsionRate: clamp(Number(motion.torsionRate ?? DEV_OPTIONS_DEFAULTS.motion.torsionRate), 0, 3),
      jitterAmp: clamp(Number(motion.jitterAmp ?? DEV_OPTIONS_DEFAULTS.motion.jitterAmp), 0, 0.08),
      identityClamp: clamp01(Number(motion.identityClamp ?? DEV_OPTIONS_DEFAULTS.motion.identityClamp)),
      smoothing: clamp(Number(motion.smoothing ?? DEV_OPTIONS_DEFAULTS.motion.smoothing), 0, 20),
      deterministicEntropyEnabled:
        motion.deterministicEntropyEnabled === undefined
          ? DEV_OPTIONS_DEFAULTS.motion.deterministicEntropyEnabled
          : !!motion.deterministicEntropyEnabled,
      entropyMin: clamp(Number(motion.entropyMin ?? DEV_OPTIONS_DEFAULTS.motion.entropyMin), 0.02, 0.08),
      entropyMax: clamp(Number(motion.entropyMax ?? DEV_OPTIONS_DEFAULTS.motion.entropyMax), 0.02, 0.08),
    },

    state: {
      source: typeof state.source === 'string' ? state.source : DEV_OPTIONS_DEFAULTS.state.source,
      overrideEnabled: !!state.overrideEnabled,
      arousal: clamp01(Number(state.arousal ?? DEV_OPTIONS_DEFAULTS.state.arousal)),
      valence: clamp(Number(state.valence ?? DEV_OPTIONS_DEFAULTS.state.valence), -1, 1),
      cognitiveLoad: clamp01(Number(state.cognitiveLoad ?? DEV_OPTIONS_DEFAULTS.state.cognitiveLoad)),
      rhythm: clamp01(Number(state.rhythm ?? DEV_OPTIONS_DEFAULTS.state.rhythm)),
      entropy: clamp(Number(state.entropy ?? DEV_OPTIONS_DEFAULTS.state.entropy), 0.02, 0.08),
      focus: clamp01(Number(state.focus ?? DEV_OPTIONS_DEFAULTS.state.focus)),
    },

    sensors: {
      mic: {
        enabled: mic.enabled === undefined ? DEV_OPTIONS_DEFAULTS.sensors.mic.enabled : !!mic.enabled,
        autoSuspendWhenOff:
          mic.autoSuspendWhenOff === undefined ? DEV_OPTIONS_DEFAULTS.sensors.mic.autoSuspendWhenOff : !!mic.autoSuspendWhenOff,
        gain: clamp(Number(mic.gain ?? DEV_OPTIONS_DEFAULTS.sensors.mic.gain), 0, 3),
        pitchDetect: mic.pitchDetect === undefined ? DEV_OPTIONS_DEFAULTS.sensors.mic.pitchDetect : !!mic.pitchDetect,
        noiseGate: clamp01(Number(mic.noiseGate ?? DEV_OPTIONS_DEFAULTS.sensors.mic.noiseGate)),
        debugHUD: !!mic.debugHUD,
      },
      cam: {
        enabled: cam.enabled === undefined ? DEV_OPTIONS_DEFAULTS.sensors.cam.enabled : !!cam.enabled,
        autoSuspendWhenOff:
          cam.autoSuspendWhenOff === undefined ? DEV_OPTIONS_DEFAULTS.sensors.cam.autoSuspendWhenOff : !!cam.autoSuspendWhenOff,
        motionSensitivity: clamp(Number(cam.motionSensitivity ?? DEV_OPTIONS_DEFAULTS.sensors.cam.motionSensitivity), 0, 3),
        downscale: clamp(Number(cam.downscale ?? DEV_OPTIONS_DEFAULTS.sensors.cam.downscale), 0.25, 1),
        debugHUD: !!cam.debugHUD,
      },
      sim: {
        enabled: !!sim.enabled,
        mode: typeof sim.mode === 'string' ? sim.mode : DEV_OPTIONS_DEFAULTS.sensors.sim.mode,
        intensity: clamp01(Number(sim.intensity ?? DEV_OPTIONS_DEFAULTS.sensors.sim.intensity)),
      },
    },

    chroma: {
      enabled: !!chroma.enabled,
      adapter: typeof chroma.adapter === 'string' ? chroma.adapter : DEV_OPTIONS_DEFAULTS.chroma.adapter,
      device: typeof chroma.device === 'string' ? chroma.device : DEV_OPTIONS_DEFAULTS.chroma.device,
      updateHz: clamp(Number(chroma.updateHz ?? DEV_OPTIONS_DEFAULTS.chroma.updateHz), 1, 60),
      intensity: clamp01(Number(chroma.intensity ?? DEV_OPTIONS_DEFAULTS.chroma.intensity)),
      phaseBias: Number.isFinite(chroma.phaseBias) ? Number(chroma.phaseBias) : DEV_OPTIONS_DEFAULTS.chroma.phaseBias,
      map: {
        arousal: typeof chroma.map?.arousal === 'string' ? chroma.map.arousal : DEV_OPTIONS_DEFAULTS.chroma.map.arousal,
        focus: typeof chroma.map?.focus === 'string' ? chroma.map.focus : DEV_OPTIONS_DEFAULTS.chroma.map.focus,
        valence: typeof chroma.map?.valence === 'string' ? chroma.map.valence : DEV_OPTIONS_DEFAULTS.chroma.map.valence,
      },
      previewRGB: !!chroma.previewRGB,
    },

    log: {
      level: typeof log.level === 'string' ? log.level : DEV_OPTIONS_DEFAULTS.log.level,
      sensorStream: !!log.sensorStream,
      stateStream: !!log.stateStream,
      renderHealth: !!log.renderHealth,
    },

    security: {
      baneSim: {
        enabled: !!security.baneSim?.enabled,
        denyLighting: !!security.baneSim?.denyLighting,
        denyMic: !!security.baneSim?.denyMic,
        denyCam: !!security.baneSim?.denyCam,
      },
      auditTrailVisible: !!security.auditTrailVisible,
    },
  }
}

let current: DevOptions = DEV_OPTIONS_DEFAULTS
const listeners = new Set<Listener>()

function loadFromStorage() {
  if (typeof window === 'undefined') return
  const parsed = safeParse(window.localStorage.getItem(LS_KEY))
  current = normalizeDevOptions(parsed)
}

function notify() {
  for (const l of Array.from(listeners)) {
    try {
      l()
    } catch {
      // ignore
    }
  }
}

export function initDevOptionsStore() {
  loadFromStorage()
}

export function getDevOptions(): DevOptions {
  return current
}

export function setDevOptions(patch: Partial<DevOptions>) {
  // Shallow merge at top-level categories, plus deep merge for known nested groups.
  const merged: any = {
    ...current,
    ...patch,
    ui: { ...current.ui, ...(patch as any).ui },
    avatar: { ...current.avatar, ...(patch as any).avatar },
    floor: { ...current.floor, ...(patch as any).floor },
    reflection: { ...current.reflection, ...(patch as any).reflection },
    lights: {
      ...current.lights,
      ...(patch as any).lights,
      spots: (
        (patch as any).lights?.spots
          ? ([
              { ...current.lights.spots[0], ...(patch as any).lights.spots?.[0] },
              { ...current.lights.spots[1], ...(patch as any).lights.spots?.[1] },
              { ...current.lights.spots[2], ...(patch as any).lights.spots?.[2] },
              { ...current.lights.spots[3], ...(patch as any).lights.spots?.[3] },
            ] as any)
          : current.lights.spots
      ),
    },
    floorShine: { ...current.floorShine, ...(patch as any).floorShine },
    post: { ...current.post, ...(patch as any).post },
    perf: { ...current.perf, ...(patch as any).perf },
    material: { ...current.material, ...(patch as any).material },
    motion: { ...current.motion, ...(patch as any).motion },
    state: { ...current.state, ...(patch as any).state },
    sensors: {
      ...current.sensors,
      ...(patch as any).sensors,
      mic: { ...current.sensors.mic, ...(patch as any).sensors?.mic },
      cam: { ...current.sensors.cam, ...(patch as any).sensors?.cam },
      sim: { ...current.sensors.sim, ...(patch as any).sensors?.sim },
    },
    chroma: {
      ...current.chroma,
      ...(patch as any).chroma,
      map: { ...current.chroma.map, ...(patch as any).chroma?.map },
    },
    log: { ...current.log, ...(patch as any).log },
    security: {
      ...current.security,
      ...(patch as any).security,
      baneSim: { ...current.security.baneSim, ...(patch as any).security?.baneSim },
    },
  }

  // Sync floorY and reflectionGroundY both ways.
  if ((patch as any).floor?.floorY !== undefined) {
    merged.reflection = { ...merged.reflection, reflectionGroundY: (patch as any).floor.floorY }
  }
  if ((patch as any).reflection?.reflectionGroundY !== undefined) {
    merged.floor = { ...merged.floor, floorY: (patch as any).reflection.reflectionGroundY }
  }

  current = normalizeDevOptions(merged)
  safeWrite(current)
  notify()
}

export function resetDevOptionsToDefaults() {
  current = DEV_OPTIONS_DEFAULTS
  safeWrite(current)
  notify()
}

export function subscribeDevOptions(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Auto-init in browser contexts.
try {
  if (typeof window !== 'undefined') initDevOptionsStore()
} catch {
  // ignore
}
