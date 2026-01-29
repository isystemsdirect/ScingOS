type SrtWsState =
	| { type: 'open' }
	| { type: 'close' }
	| { type: 'error'; message: string }

export function connectSrtWS(
	url: string,
	onMsg: (msg: any) => void,
	onState?: (state: SrtWsState) => void,
) {
	let ws: WebSocket | null = null

	function safeState(s: SrtWsState) {
		try {
			onState?.(s)
		} catch {
			// ignore
		}
	}

	try {
		ws = new WebSocket(url)
	} catch (e: any) {
		safeState({ type: 'error', message: String(e) })
		return { close() {}, send(_obj: any) {} }
	}

	ws.onopen = () => safeState({ type: 'open' })
	ws.onclose = () => safeState({ type: 'close' })
	ws.onerror = () => safeState({ type: 'error', message: 'ws_error' })
	ws.onmessage = (ev) => {
		try {
			const msg = JSON.parse(String(ev.data))
			onMsg(msg)
		} catch {
			// ignore
		}
	}

	return {
		send(obj: any) {
			try {
				if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj))
			} catch {
				// ignore
			}
		},
		close() {
			try {
				ws?.close()
			} catch {
				// ignore
			}
		},
	}
}
