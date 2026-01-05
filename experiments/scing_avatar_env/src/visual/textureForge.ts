import * as THREE from 'three'

export type TextureForgeOutput = {
  albedo: THREE.DataTexture
  normal: THREE.DataTexture
  size: number
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return s - Math.floor(s)
}

function fbm(x: number, y: number) {
  let v = 0
  let a = 0.5
  let f = 1
  for (let i = 0; i < 5; i++) {
    v += a * hash2(x * f, y * f)
    f *= 2
    a *= 0.5
  }
  return v
}

export function buildTextures(size: number): TextureForgeOutput {
  const N = size
  const px = N * N

  const height = new Float32Array(px)
  const albedoData = new Uint8Array(px * 4)
  const normalData = new Uint8Array(px * 4)

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / (N - 1)
      const v = y / (N - 1)
      const w1 = fbm(u * 6 + 10.1, v * 6 + 4.7)
      const w2 = fbm(u * 10 + 2.3, v * 10 + 9.2)
      const h = clamp01(0.55 * w1 + 0.45 * w2)
      height[y * N + x] = h
    }
  }

  const sample = (x: number, y: number) => {
    const xx = Math.max(0, Math.min(N - 1, x))
    const yy = Math.max(0, Math.min(N - 1, y))
    return height[yy * N + xx]
  }

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x
      const hC = sample(x, y)
      const hX = sample(x + 1, y) - sample(x - 1, y)
      const hY = sample(x, y + 1) - sample(x, y - 1)

      const nx = -hX * 2.0
      const ny = -hY * 2.0
      const nz = 1.0
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
      const n0 = nx / len
      const n1 = ny / len
      const n2 = nz / len

      normalData[i * 4 + 0] = Math.floor((n0 * 0.5 + 0.5) * 255)
      normalData[i * 4 + 1] = Math.floor((n1 * 0.5 + 0.5) * 255)
      normalData[i * 4 + 2] = Math.floor((n2 * 0.5 + 0.5) * 255)
      normalData[i * 4 + 3] = 255

      const u = x / (N - 1)
      const v = y / (N - 1)
      const ring = 0.5 + 0.5 * Math.sin((u * 2 - 1) * 6 + (v * 2 - 1) * 6)
      const e = clamp01(0.65 * hC + 0.35 * ring)

      const r = clamp01(0.20 + 0.85 * e)
      const g = clamp01(0.08 + 0.55 * (1 - e))
      const b = clamp01(0.35 + 0.90 * (1 - 0.4 * e))

      albedoData[i * 4 + 0] = Math.floor(r * 255)
      albedoData[i * 4 + 1] = Math.floor(g * 255)
      albedoData[i * 4 + 2] = Math.floor(b * 255)
      albedoData[i * 4 + 3] = 255
    }
  }

  const albedo = new THREE.DataTexture(albedoData, N, N, THREE.RGBAFormat)
  albedo.colorSpace = THREE.SRGBColorSpace
  albedo.wrapS = albedo.wrapT = THREE.RepeatWrapping
  albedo.needsUpdate = true

  const normal = new THREE.DataTexture(normalData, N, N, THREE.RGBAFormat)
  normal.colorSpace = THREE.NoColorSpace
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping
  normal.needsUpdate = true

  return { albedo, normal, size: N }
}
