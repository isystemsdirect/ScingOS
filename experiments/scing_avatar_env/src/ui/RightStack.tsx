import { useEffect } from 'react'
import DevPanel from './DevPanel'
import { resetDevOptions, toggle } from '../dev/devOptionsStore'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'

export default function RightStack() {
  const opt = useDevOptionsStore()

  // Always-on hotkeys so you can recover from hidden panels.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return
      const k = e.key.toLowerCase()
      if (k === 'p') toggle('devPanelVisible')
      if (k === 'h') toggle('hudVisible')
      if (k === 'a') toggle('avatarVisible')
      if (k === 'r') resetDevOptions()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!opt.devPanelVisible) return null

  const width = 'min(20vw, 360px)'
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: 14,
        right: 14,
        width,
        minWidth: 220,
        maxWidth: 420,
        maxHeight: 'calc(100vh - 2 * 14px)',
        overflow: 'auto',
        display: 'grid',
        gap: 12,
        pointerEvents: 'auto',
      }}
    >
      {opt.devPanelVisible ? <DevPanel mode="stack" /> : null}
    </div>
  )
}
