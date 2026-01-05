import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Safe DOM remove: never throws, never double-removes.
function safeRemoveNode(node: Node | null | undefined) {
	if (!node) return
	const p = node.parentNode
	if (!p) return
	try {
		if (p.contains(node)) p.removeChild(node)
	} catch {
		// swallow
	}
}

function ensureRoot(): HTMLElement {
	let el = document.getElementById('root')
	if (el) return el
	el = document.createElement('div')
	el.id = 'root'
	document.body.appendChild(el)
	return el
}

function renderFatalOverlay(title: string, detail?: string) {
	try {
		const id = 'scing_avatar_env_fatal'
		let el = document.getElementById(id)
		if (!el) {
			el = document.createElement('div')
			el.id = id
			document.body.appendChild(el)
		}

		el.style.position = 'fixed'
		el.style.inset = '0'
		el.style.zIndex = '2147483647'
		el.style.background = 'rgba(6, 4, 10, 0.96)'
		el.style.color = 'rgba(255,255,255,0.92)'
		el.style.fontFamily =
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
		el.style.fontSize = '12px'
		el.style.lineHeight = '1.35'
		el.style.padding = '16px'
		el.style.whiteSpace = 'pre-wrap'
		el.textContent = `${title}${detail ? `\n\n${detail}` : ''}`
	} catch {
		// ignore
	}
}

declare global {
	interface Window {
		__scing_avatar_env_app_mounted?: boolean
		__scing_avatar_env_last_frame_ms?: number
	}
}

// If the app crashes before React can show diagnostics, fail loud.
window.addEventListener('error', (e) => {
	renderFatalOverlay(`FATAL: ${e.message || 'Unknown error'}`, (e.error && (e.error as any).stack) || undefined)
})

window.addEventListener('unhandledrejection', (e) => {
	const reason: any = (e as any).reason
	const msg = typeof reason === 'string' ? reason : reason?.message || 'Unhandled rejection'
	renderFatalOverlay(`FATAL: ${msg}`, reason?.stack)
})

const root = ensureRoot()
root.textContent = 'Loading emulator…'

// Watchdog: if the app fails to mount or the render loop stalls, show a visible overlay.
try {
	window.__scing_avatar_env_app_mounted = false
	window.__scing_avatar_env_last_frame_ms = 0
} catch {
	// ignore
}

try {
	window.setTimeout(() => {
		try {
			if (!window.__scing_avatar_env_app_mounted) {
				renderFatalOverlay(
					'BOOT STALLED: React did not mount',
					'If this persists, open DevTools console for the failing module/network request.',
				)
			}
		} catch {
			// ignore
		}
	}, 2500)

	window.setInterval(() => {
		try {
			if (!window.__scing_avatar_env_app_mounted) return
			const last = Number(window.__scing_avatar_env_last_frame_ms || 0)
			if (!last) return
			const age = performance.now() - last
			if (age > 3000) {
				renderFatalOverlay(
					'RENDER STALLED: no frames for >3s',
					'This indicates a WebGL context loss or a render-loop failure. Check the “Last crash” button or DevTools console.',
				)
			}
		} catch {
			// ignore
		}
	}, 1000)
} catch {
	// ignore
}

try {
	ReactDOM.createRoot(root).render(
		<App />,
	)
	// If the module loaded and React render was invoked, we can safely remove the HTML boot screen.
	// If rendering later stalls, the watchdog overlay will take over.
	window.setTimeout(() => {
		try {
			safeRemoveNode(document.getElementById('scing-boot-screen'))
		} catch {
			// ignore
		}
	}, 0)
} catch (err: any) {
	renderFatalOverlay('FATAL: React failed to mount', err?.stack || String(err))
}
