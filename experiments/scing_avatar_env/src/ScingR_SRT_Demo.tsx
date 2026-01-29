import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

import { SRT_STATES, clamp01, deriveParams, normalizeState, type SrtState } from './srt'
import { connectSrtWS } from './ws'

type SrtModel = { state: SrtState; intensity: number }

type LayoutMode = 'GALAXY' | 'STORE'
type Store = { id: string; name: string }

declare global {
	interface Window {
		__scing_avatar_env_app_mounted?: boolean
		__scing_avatar_env_last_frame_ms?: number
		__scing_avatar_env_webgl_context_lost?: boolean
	}
}

function FrameHeartbeat() {
	useFrame(() => {
		try {
			window.__scing_avatar_env_last_frame_ms = performance.now()
		} catch {
			// ignore
		}
	})
	return null
}

function WebGLContextSentinel() {
	const { gl } = useThree()
	useEffect(() => {
		const canvas = gl.domElement
		const onLost = (e: Event) => {
			try {
				// Prevent default so the browser may attempt restore.
				;(e as any).preventDefault?.()
			} catch {
				// ignore
			}
			try {
				window.__scing_avatar_env_webgl_context_lost = true
			} catch {
				// ignore
			}
		}
		const onRestored = () => {
			try {
				window.__scing_avatar_env_webgl_context_lost = false
				window.__scing_avatar_env_last_frame_ms = performance.now()
			} catch {
				// ignore
			}
		}

		canvas.addEventListener('webglcontextlost', onLost, false)
		canvas.addEventListener('webglcontextrestored', onRestored, false)
		return () => {
			canvas.removeEventListener('webglcontextlost', onLost, false)
			canvas.removeEventListener('webglcontextrestored', onRestored, false)
		}
	}, [gl])
	return null
}

function mulberry32(seed: number) {
	let t = seed >>> 0
	return () => {
		t += 0x6d2b79f5
		let x = Math.imul(t ^ (t >>> 15), 1 | t)
		x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
		return ((x ^ (x >>> 14)) >>> 0) / 4294967296
	}
}

function Starfield({ count = 900, radius = 38 }: { count?: number; radius?: number }) {
	const positions = useMemo(() => {
		const rnd = mulberry32(0x53a7_7e1d)
		const arr = new Float32Array(count * 3)
		for (let i = 0; i < count; i++) {
			const u = rnd()
			const v = rnd()
			const theta = 2 * Math.PI * u
			const phi = Math.acos(2 * v - 1)
			const r = radius * (0.55 + 0.45 * Math.pow(rnd(), 0.6))

			arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
			arr[i * 3 + 1] = r * Math.cos(phi)
			arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
		}
		return arr
	}, [count, radius])

	return (
		<points>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[positions, 3]} />
			</bufferGeometry>
			<pointsMaterial size={0.045} transparent opacity={0.65} color="#9be7ff" sizeAttenuation depthWrite={false} />
		</points>
	)
}

function SaturnOrbHalo({
	srt,
	layoutMode,
	storeIndex,
	stores,
}: {
	srt: SrtModel
	layoutMode: LayoutMode
	storeIndex: number
	stores: Store[]
}) {
	const inst = useRef<THREE.InstancedMesh>(null)
	const ringGroup = useRef<THREE.Group>(null)

	// ORB ring capacity (visual density)
	const COUNT = 640

	// GALAXY: multiple STORE bands
	const bands = Math.max(3, Math.min(7, stores.length || 3))
	const bandGap = 0.22
	const tilt = 0.55

	// Base radii
	const rInner = 1.45
	const rOuter = 2.65
	const thickness = 0.18

	const tmpObj = useMemo(() => new THREE.Object3D(), [])
	const baseColor = useMemo(() => new THREE.Color(0x00ffff), [])
	const alertColor = useMemo(() => new THREE.Color(0xff4d6d), [])

	const seeds = useMemo(() => {
		const rnd = mulberry32(0x12ab_90ef)
		const arr: Array<{ r: number; a: number; y: number; s: number; band: number }> = []
		for (let i = 0; i < COUNT; i++) {
			const band = i % bands
			const r = rInner + (rOuter - rInner) * rnd()
			const a = Math.PI * 2 * rnd()
			const y = (rnd() - 0.5) * thickness
			const s = 0.016 + rnd() * 0.045
			arr.push({ r, a, y, s, band })
		}
		return arr
	}, [bands])

	function bandRadiusOffset(b: number) {
		const center = (bands - 1) / 2
		return (b - center) * bandGap
	}

	function placeAll() {
		if (!inst.current) return
		for (let i = 0; i < seeds.length; i++) {
			const it = seeds[i]
			const isStoreMode = layoutMode === 'STORE'

			// GALAXY dominance: selected store band should visually lead.
			const selectedBand = ((storeIndex % bands) + bands) % bands
			const isSelectedBand = !isStoreMode && it.band === selectedBand
			const domRadiusBias = isSelectedBand ? 0.10 : 0.0
			const domScaleBias = isSelectedBand ? 1.25 : 1.0

			const rBand = isStoreMode ? (rInner + rOuter) * 0.5 : it.r + bandRadiusOffset(it.band) + domRadiusBias
			const yBand = isStoreMode ? it.y * 0.35 : it.y

			const x = Math.cos(it.a) * rBand
			const z = Math.sin(it.a) * rBand

			tmpObj.position.set(x, yBand, z)
			tmpObj.scale.setScalar(it.s * domScaleBias)
			tmpObj.rotation.set(0, it.a, 0)
			tmpObj.updateMatrix()
			inst.current.setMatrixAt(i, tmpObj.matrix)
		}

		inst.current.instanceMatrix.needsUpdate = true
	}

	useEffect(() => {
		placeAll()
	}, [layoutMode, storeIndex, stores.length, seeds, tmpObj])

	useFrame((state) => {
		const t = state.clock.getElapsedTime()
		const { pulseMs, spin, glow } = deriveParams(normalizeState(srt.state), srt.intensity)

		const drift = (Math.sin(t * 0.55) + 1) * 0.5
		const micro = (Math.sin(t * 4.2) + 1) * 0.5
		const wobble = (drift - 0.5) * 0.12 + (micro - 0.5) * 0.04

		if (ringGroup.current) {
			ringGroup.current.rotation.y += 0.0035 * spin
			ringGroup.current.rotation.x = tilt + wobble
			ringGroup.current.rotation.z = -0.08 - wobble * 0.35

			// In STORE mode, bias orientation subtly per-store so it feels "entered".
			if (layoutMode === 'STORE') {
				ringGroup.current.rotation.y += storeIndex * 0.0008
			}
		}

		const pulse = 0.010 + srt.intensity * 0.030
		const pulseWave = Math.sin((((t * 1000) / pulseMs) * Math.PI * 2)) * pulse
		if (ringGroup.current) ringGroup.current.scale.setScalar(1 + pulseWave)

		const isAlert = normalizeState(srt.state) === 'ALERT'
		const c = isAlert ? alertColor : baseColor

		const mat = inst.current?.material as THREE.MeshStandardMaterial | undefined
		if (mat) {
			mat.color.copy(c)
			mat.emissive.copy(c)

			const storeBoost = layoutMode === 'STORE' ? 1.35 : 0.92
			mat.emissiveIntensity = (0.18 + glow * 0.9) * storeBoost
			mat.roughness = 0.22
			mat.metalness = 0.75
			mat.opacity = layoutMode === 'STORE' ? 0.92 : 0.82
			mat.transparent = true
		}
	})

	return (
		<group ref={ringGroup}>
			<instancedMesh ref={inst} args={[undefined, undefined, COUNT]}>
				<sphereGeometry args={[1, 12, 12]} />
				<meshStandardMaterial />
			</instancedMesh>
		</group>
	)
}

function ScavatarPlaceholder({
	srt,
	layoutMode,
	storeIndex,
	stores,
}: {
	srt: SrtModel
	layoutMode: LayoutMode
	storeIndex: number
	stores: Store[]
}) {
	const group = useRef<THREE.Group>(null)
	const orb = useRef<THREE.Mesh>(null)

	const baseColor = useRef(new THREE.Color(0x00ffff))
	const alertColor = useRef(new THREE.Color(0xff4d6d))

	useFrame((state) => {
		const t = state.clock.getElapsedTime()
		const { pulseMs, jitter, spin, glow } = deriveParams(srt.state, srt.intensity)

		const drift = (Math.sin(t * 0.8) + 1) * 0.5
		const micro = (Math.sin(t * 6.0) + 1) * 0.5

		const pulse = 0.015 + srt.intensity * 0.06
		const pulseWave = Math.sin(((t * 1000) / pulseMs) * Math.PI * 2) * pulse

		const jx = (micro - 0.5) * jitter * 0.1
		const jy = (drift - 0.5) * jitter * 0.12

		if (group.current) {
			group.current.rotation.y += 0.006 * spin
			group.current.rotation.x = 0.12 + jx
			group.current.rotation.z = -0.08 + jy
			group.current.scale.setScalar(1 + pulseWave)
		}

		const isAlert = srt.state === 'ALERT'
		const c = isAlert ? alertColor.current : baseColor.current

		const mat = (orb.current?.material as THREE.MeshStandardMaterial | undefined) ?? undefined
		if (mat) {
			mat.color.copy(c)
			mat.emissive.copy(c)
			mat.emissiveIntensity = 0.35 + glow
			mat.roughness = 0.25
			mat.metalness = 0.55
		}
	})

	return (
		<group ref={group}>
			<mesh ref={orb}>
				<sphereGeometry args={[1.05, 64, 64]} />
				<meshStandardMaterial />
			</mesh>
			<SaturnOrbHalo srt={srt} layoutMode={layoutMode} storeIndex={storeIndex} stores={stores} />
		</group>
	)
}

function Splash({ show }: { show: boolean }) {
	if (!show) return null
	return (
		<Html center>
			<div
				style={{
					padding: '18px 20px',
					border: '1px solid #0b2b2b',
					borderRadius: '16px',
					background: 'rgba(0,0,0,.65)',
					color: '#00ffff',
					fontFamily: 'Arial, sans-serif',
					textAlign: 'center',
				}}
			>
				<div
					style={{
						width: 120,
						height: 120,
						borderRadius: '50%',
						border: '2px solid #00ffff',
						boxShadow: '0 0 26px rgba(0,255,255,.18)',
						margin: '0 auto 12px auto',
					}}
				/>
				<div style={{ fontSize: 20, letterSpacing: 1 }}>ScingR</div>
				<div style={{ fontSize: 12, color: '#8aa' }}>SRT Visual Runtime</div>
			</div>
		</Html>
	)
}

export default function ScingR_SRT_Demo() {
	const [endpoint, setEndpoint] = useState('ws://127.0.0.1:8787')
	const [linked, setLinked] = useState(false)
	const [srt, setSrt] = useState<SrtModel>({ state: 'IDLE', intensity: 0.55 })

	const stores: Store[] = useMemo(
		() => [
			{ id: 'store-core', name: 'CORE STORE' },
			{ id: 'store-lab', name: 'LAB STORE' },
			{ id: 'store-media', name: 'MEDIA STORE' },
			{ id: 'store-tools', name: 'TOOLS STORE' },
			{ id: 'store-vault', name: 'VAULT STORE' },
		],
		[],
	)

	const [storeIndex, setStoreIndex] = useState(0)
	const [layoutMode, setLayoutMode] = useState<LayoutMode>('GALAXY')
	function enterStore() {
		setLayoutMode('STORE')
	}
	function exitStore() {
		setLayoutMode('GALAXY')
	}
	const wsRef = useRef<ReturnType<typeof connectSrtWS> | null>(null)

	useEffect(() => {
		try {
			window.__scing_avatar_env_app_mounted = true
		} catch {
			// ignore
		}
	}, [])

	function applySrt(next: Partial<{ state: unknown; mode: unknown; intensity: unknown }>) {
		const st = normalizeState((next as any).state ?? (next as any).mode ?? 'IDLE')
		const itRaw = (next as any).intensity
		const it = typeof itRaw === 'number' ? clamp01(itRaw) : srt.intensity
		setSrt({ state: st, intensity: it })
	}

	function connect() {
		wsRef.current?.close()
		wsRef.current = connectSrtWS(
			endpoint,
			(msg) => {
				if (msg?.type === 'srt') applySrt(msg)
			},
			(st) => {
				if (st.type === 'open') {
					setLinked(true)
					wsRef.current?.send({ type: 'hello', agent: 'ScingR', ts: Date.now() })
				}
				if (st.type === 'close') setLinked(false)
				if (st.type === 'error') setLinked(false)
			},
		)
	}

	function disconnect() {
		wsRef.current?.close()
		wsRef.current = null
		setLinked(false)
	}

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '420px 1fr',
				height: '100vh',
				background: '#000',
				color: '#00ffff',
			}}
		>
			<div
				style={{
					borderRight: '1px solid #0b2b2b',
					padding: 16,
					overflow: 'auto',
					fontFamily: 'Arial, sans-serif',
				}}
			>
				<div style={{ fontSize: 22, letterSpacing: 1 }}>ScingR</div>
				<div style={{ fontSize: 12, color: '#8aa', marginTop: 6 }}>SRT 3D (Vite)</div>
				<div
					style={{
						marginTop: 10,
						display: 'inline-block',
						padding: '6px 10px',
						border: '1px solid #0b2b2b',
						borderRadius: 999,
						fontSize: 12,
						color: linked ? '#7CFC00' : '#ffd166',
					}}
				>
					{linked ? 'LINKED' : 'DISCONNECTED'}
				</div>

				<div style={{ marginTop: 12, border: '1px solid #0b2b2b', borderRadius: 14, padding: 12, background: '#010909' }}>
					<div style={{ fontSize: 11, color: '#8aa', marginBottom: 8 }}>Endpoint</div>
					<input
						value={endpoint}
						onChange={(e) => setEndpoint(e.target.value)}
						style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #0b2b2b', background: '#020b0b', color: '#00ffff' }}
					/>
					<div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
						<button
							onClick={connect}
							disabled={linked}
							style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #0b2b2b', background: '#021515', color: '#00ffff' }}
						>
							Connect
						</button>
						<button
							onClick={disconnect}
							disabled={!linked}
							style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #0b2b2b', background: '#021515', color: '#00ffff' }}
						>
							Disconnect
						</button>
					</div>
				</div>

				<div style={{ marginTop: 12, border: '1px solid #0b2b2b', borderRadius: 14, padding: 12, background: '#010909' }}>
					<div style={{ fontSize: 11, color: '#8aa', marginBottom: 8 }}>SRT State</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{SRT_STATES.map((st) => (
							<button
								key={st}
								onClick={() => applySrt({ state: st })}
								style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #0b2b2b', background: '#021515', color: '#00ffff' }}
							>
								{st}
							</button>
						))}
					</div>

					<div style={{ fontSize: 11, color: '#8aa', margin: '12px 0 8px 0' }}>Intensity</div>
					<input
						type="range"
						min="0"
						max="100"
						value={Math.round(srt.intensity * 100)}
						onChange={(e) => applySrt({ intensity: parseInt(e.target.value, 10) / 100 })}
						style={{ width: '100%' }}
					/>
					<div style={{ marginTop: 8, fontFamily: 'Consolas, monospace', fontSize: 12, color: '#c9ffff' }}>
						STATE={srt.state} INTENSITY={srt.intensity.toFixed(2)}
					</div>
				</div>

				<div style={{ marginTop: 12, fontSize: 12, color: '#8aa' }}>
					Run one command:{' '}
					<span style={{ color: '#c9ffff', fontFamily: 'Consolas, monospace' }}>npm run dev:all</span>
				</div>

				<div style={{ marginTop: 12, border: '1px solid #0b2b2b', borderRadius: 14, padding: 12, background: '#010909' }}>
					<div style={{ fontSize: 11, color: '#8aa', marginBottom: 8 }}>STORE TOPOLOGY</div>

					<div style={{ display: 'grid', gap: 8 }}>
						<div style={{ fontSize: 12, color: '#c9ffff' }}>
							MODE: <span style={{ fontFamily: 'Consolas, monospace' }}>{layoutMode}</span>
						</div>

						<div style={{ fontSize: 11, color: '#8aa' }}>Selected Store</div>
						<select
							value={storeIndex}
							onChange={(e) => setStoreIndex(parseInt(e.target.value, 10))}
							style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #0b2b2b', background: '#020b0b', color: '#00ffff' }}
						>
							{stores.map((s, i) => (
								<option key={s.id} value={i}>
									{s.name}
								</option>
							))}
						</select>

						<div style={{ display: 'flex', gap: 10 }}>
							<button
								onClick={enterStore}
								style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #0b2b2b', background: '#021515', color: '#00ffff' }}
							>
								Enter Store
							</button>
							<button
								onClick={exitStore}
								style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #0b2b2b', background: '#021515', color: '#00ffff' }}
							>
								Exit Store
							</button>
						</div>

						<div style={{ fontSize: 11, color: '#8aa' }}>GALAXY = multiple STORE rings. STORE = collapse into one ring.</div>
					</div>
				</div>
			</div>

			<div style={{ height: '100vh' }}>
				<Canvas
					camera={{ position: [0, 0.6, 4.2], fov: 52 }}
					dpr={[1, 1.5]}
					gl={{ antialias: true, powerPreference: 'high-performance' }}
				>
					<color attach="background" args={['#00040a']} />
					<fog attach="fog" args={['#00040a', 4.2, 14]} />
					<ambientLight intensity={0.55} />
					<directionalLight position={[3, 4, 2]} intensity={1.1} />
					<pointLight position={[-3, -1, 2]} intensity={0.7} />
					<FrameHeartbeat />
					<WebGLContextSentinel />
					<Starfield />
					<ScavatarPlaceholder srt={srt} layoutMode={layoutMode} storeIndex={storeIndex} stores={stores} />
					<OrbitControls enablePan={false} enableZoom={false} />
					<Splash show={!linked} />
				</Canvas>
			</div>
		</div>
	)
}
