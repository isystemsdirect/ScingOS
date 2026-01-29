export const SRT_STATES = ['IDLE', 'LISTENING', 'THINKING', 'SPEAKING', 'ALERT'] as const

export type SrtState = (typeof SRT_STATES)[number]

export function clamp01(v: number) {
	return Math.max(0, Math.min(1, v))
}

export function normalizeState(s: unknown): SrtState {
	const st = String(s ?? 'IDLE').toUpperCase()
	return (SRT_STATES as readonly string[]).includes(st) ? (st as SrtState) : 'IDLE'
}

export function deriveParams(state: SrtState, intensity: number) {
	const I = clamp01(intensity)

	let pulse = 2400
	let jitter = 0.0
	let spin = 0.22
	let glow = 0.35
	switch (state) {
		case 'IDLE':
			pulse = 2600
			jitter = 0.04
			spin = 0.18
			glow = 0.3
			break
		case 'LISTENING':
			pulse = 1500
			jitter = 0.1
			spin = 0.28
			glow = 0.48
			break
		case 'THINKING':
			pulse = 1100
			jitter = 0.12
			spin = 0.34
			glow = 0.56
			break
		case 'SPEAKING':
			pulse = 900
			jitter = 0.16
			spin = 0.4
			glow = 0.62
			break
		case 'ALERT':
			pulse = 650
			jitter = 0.22
			spin = 0.52
			glow = 0.78
			break
	}

	const k = 1 - I * 0.45
	pulse = Math.round(pulse * k)
	spin = spin * (1 + I * 0.9)
	glow = glow * (0.7 + I * 0.8)

	return { pulseMs: pulse, jitter, spin, glow }
}
