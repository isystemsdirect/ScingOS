import * as THREE from 'three'

// Deterministic hash -> 0..1
function hash01(x: number, y: number, seed: number) {
	const v = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123
	return v - Math.floor(v)
}

// Smoothstep
function s(t: number) {
	return t * t * (3 - 2 * t)
}

// Value noise (2D), deterministic
function vnoise(x: number, y: number, seed: number) {
	const x0 = Math.floor(x)
	const y0 = Math.floor(y)
	const x1 = x0 + 1
	const y1 = y0 + 1

	const fx = x - x0
	const fy = y - y0

	const a = hash01(x0, y0, seed)
	const b = hash01(x1, y0, seed)
	const c = hash01(x0, y1, seed)
	const d = hash01(x1, y1, seed)

	const ux = s(fx)
	const uy = s(fy)

	const ab = a + (b - a) * ux
	const cd = c + (d - c) * ux
	return ab + (cd - ab) * uy
}

// Fractal noise for liquid wobble
function fbm(x: number, y: number, seed: number) {
	let v = 0
	let amp = 0.5
	let freq = 1
	for (let i = 0; i < 4; i++) {
		v += amp * vnoise(x * freq, y * freq, seed + i * 13.13)
		freq *= 2
		amp *= 0.5
	}
	return v
}

export function createDistortionTexture(size = 256) {
	const data = new Uint8Array(size * size * 3)
	const tex = new THREE.DataTexture(data, size, size, THREE.RGBFormat)
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping
	tex.magFilter = THREE.LinearFilter
	tex.minFilter = THREE.LinearMipMapLinearFilter
	tex.needsUpdate = true

	const state = {
		size,
		data,
		tex,
		seed: 19.73,
	}

	function update(time: number) {
		// Liquid drift: time drives domain warp; still deterministic
		const t = time * 0.25
		const s0 = state.size
		const d = state.data

		let p = 0
		for (let y = 0; y < s0; y++) {
			for (let x = 0; x < s0; x++) {
				const u = x / s0
				const v = y / s0

				// Domain warp to create “organic” undulation
				const w1 = fbm(u * 3.0 + t, v * 3.0 - t, state.seed)
				const w2 = fbm(u * 3.0 - t * 1.1, v * 3.0 + t * 0.9, state.seed + 101.0)

				// Convert to a normal-like RGB field (centered at 0.5)
				const nx = (w1 - 0.5) * 0.9
				const ny = (w2 - 0.5) * 0.9

				d[p++] = Math.max(0, Math.min(255, Math.floor((0.5 + nx) * 255)))
				d[p++] = Math.max(0, Math.min(255, Math.floor((0.5 + ny) * 255)))
				d[p++] = 128
			}
		}

		state.tex.needsUpdate = true
	}

	return { texture: state.tex, update }
}
