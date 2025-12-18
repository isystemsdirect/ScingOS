import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import DevPanel from './DevPanel'

export default function RightRail() {
  const opt = useDevOptionsStore()
  if (!opt.showDevPanel) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        width: 'min(360px, 20vw)',
        zIndex: 9997,
        maxHeight: 'calc(100vh - 24px)',
        overflow: 'auto',
        pointerEvents: 'auto',
      }}
    >
      <DevPanel />
    </div>
  )
}
