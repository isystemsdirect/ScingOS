import type { CSSProperties, ReactNode } from 'react'

type Side = 'left' | 'right'
type Mode = 'fixed' | 'stack'

export default function DevCard(props: {
  title?: string
  children: ReactNode
  side?: Side // default: left
  top?: number // default: 14
  mode?: Mode // default: fixed
}) {
  const side: Side = props.side ?? 'left'
  const top = props.top ?? 14
  const mode: Mode = props.mode ?? 'fixed'

  const base: CSSProperties = {
    position: mode === 'fixed' ? 'fixed' : 'relative',
    zIndex: 9999,
    top: mode === 'fixed' ? top : undefined,
    // WIDTH POLICY: <= 20% viewport (but not crazy narrow/wide)
    width: mode === 'fixed' ? 'min(20vw, 360px)' : '100%',
    minWidth: mode === 'fixed' ? 220 : undefined,
    maxWidth: mode === 'fixed' ? 420 : undefined,
    // HEIGHT POLICY: never obscure the scene; scroll if taller
    maxHeight: mode === 'fixed' ? 'calc(100vh - 2 * 14px)' : undefined,
    overflow: mode === 'fixed' ? 'auto' : 'visible',

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

  const pos: CSSProperties =
    mode === 'fixed' ? (side === 'right' ? { right: 14 } : { left: 14 }) : {}

  return (
    <div style={{ ...base, ...pos }}>
      {props.title ? (
        <div style={{ marginBottom: 10, fontSize: 12, letterSpacing: 0.6, opacity: 0.9 }}>{props.title}</div>
      ) : null}
      {props.children}
    </div>
  )
}
