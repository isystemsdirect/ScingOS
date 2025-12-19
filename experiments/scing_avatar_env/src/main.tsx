import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

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

try {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	)
} catch (err: any) {
	renderFatalOverlay('FATAL: React failed to mount', err?.stack || String(err))
}
