import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  error?: string
}

function fmtUnknown(e: unknown) {
  if (e instanceof Error) return `${e.name}: ${e.message}\n${e.stack ?? ''}`
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

export class ErrorOverlay extends React.Component<Props, State> {
  state: State = {}

  private onWindowError = (event: ErrorEvent) => {
    const details = event.error ? fmtUnknown(event.error) : `${event.message}\n${event.filename}:${event.lineno}:${event.colno}`
    this.setState({ error: details })
  }

  private onUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.setState({ error: fmtUnknown(event.reason) })
  }

  componentDidMount() {
    window.addEventListener('error', this.onWindowError)
    window.addEventListener('unhandledrejection', this.onUnhandledRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.onWindowError)
    window.removeEventListener('unhandledrejection', this.onUnhandledRejection)
  }

  static getDerivedStateFromError(error: unknown): State {
    return { error: fmtUnknown(error) }
  }

  componentDidCatch() {
    // handled by UI
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0,0,0,0.92)',
            color: 'rgba(255,255,255,0.92)',
            padding: 16,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 12,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>SCING AVATAR ENV — Runtime Error</div>
          {this.state.error}
        </div>
      )
    }

    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 8,
            left: 8,
            zIndex: 9997,
            padding: '4px 8px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.75)',
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
            fontSize: 11,
            pointerEvents: 'none',
          }}
        >
          boot: ok
        </div>
        {this.props.children}
      </>
    )
  }
}
