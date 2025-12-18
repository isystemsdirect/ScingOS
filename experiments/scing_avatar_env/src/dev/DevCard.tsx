import type { CSSProperties, ReactNode } from 'react'

type Side = 'left' | 'right'

export default function DevCard(props: {
  title?: string
  children: ReactNode
  side?: Side // default: left
  top?: number // default: 14
}) {
  const side: Side = props.side ?? 'left'
  const top = props.top ?? 14

  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    top,
    // WIDTH POLICY: <= 20% viewport (but not crazy narrow/wide)
    width: 'min(20vw, 360px)',
    minWidth: 220,
    maxWidth: 420,
    // HEIGHT POLICY: never obscure the scene; scroll if taller
    maxHeight: 'calc(100vh - 2 * 14px)',
    overflow: 'auto',

    padding: 12,
    borderRadius: 12,
    background: 'rgba(8, 6, 18, 0.78)',
    border: '1px solid rgba(138, 92, 255, 0.30)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
    color: 'rgba(240,240,255,0.92)',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    fontSize: 12.5,
    lineHeight: 1.25,
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto',
  }

  const pos: CSSProperties = side === 'right' ? { right: 14 } : { left: 14 }

  return (
    <div style={{ ...base, ...pos }}>
      {props.title ? (
        <div style={{ marginBottom: 10, fontSize: 12, letterSpacing: 0.6, opacity: 0.9 }}>{props.title}</div>
      ) : null}
      {props.children}
    </div>
  )
}
