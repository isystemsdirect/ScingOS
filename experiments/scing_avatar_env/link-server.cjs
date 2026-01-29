const WebSocket = require('ws')

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8787
const wss = new WebSocket.Server({ port })

console.log(`SRT link-server listening on ws://127.0.0.1:${port}`)

const states = ['IDLE', 'LISTENING', 'THINKING', 'SPEAKING', 'THINKING', 'IDLE', 'ALERT', 'IDLE']
let idx = 0

function clamp01(v) {
	return Math.max(0, Math.min(1, v))
}

function baseIntensity(state) {
	switch (state) {
		case 'IDLE':
			return 0.4
		case 'LISTENING':
			return 0.62
		case 'THINKING':
			return 0.78
		case 'SPEAKING':
			return 0.7
		case 'ALERT':
			return 0.92
		default:
			return 0.55
	}
}

function boundedWobble(base) {
	const t = Date.now()
	const drift = (Math.sin(t / 1700) + 1) * 0.5 // 0..1
	const micro = (Math.sin(t / 330) + 1) * 0.5 // 0..1
	return clamp01(base + (drift - 0.5) * 0.12 + (micro - 0.5) * 0.06)
}

wss.on('connection', (socket) => {
	console.log('Client connected.')
	socket.send(JSON.stringify({ type: 'status', state: 'linked', ts: Date.now() }))

	const heartbeat = setInterval(() => {
		socket.send(JSON.stringify({ type: 'heartbeat', ts: Date.now() }))
	}, 1500)

	const srtTicker = setInterval(() => {
		const st = states[idx % states.length]
		const intensity = boundedWobble(baseIntensity(st))
		socket.send(JSON.stringify({ type: 'srt', state: st, intensity, source: 'link-server', ts: Date.now() }))
		idx++
	}, 2200)

	socket.on('message', (msg) => {
		try {
			const txt = msg.toString()
			console.log('RX:', txt)
			socket.send(JSON.stringify({ type: 'echo', data: txt, ts: Date.now() }))
		} catch {
			// ignore
		}
	})

	socket.on('close', () => {
		clearInterval(heartbeat)
		clearInterval(srtTicker)
		console.log('Client disconnected.')
	})
})
