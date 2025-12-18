import { useEffect, useState } from 'react'
import { getAvatarState } from './influence/InfluenceBridge'
import { getMediaSensorsMetrics, getMediaSensorsStatus } from './sensors/mediaSensors'
import { getQualityMode, toggleQualityMode } from './visual/qualityMode'
import { getDevOptions, subscribeDevOptions } from './dev/devOptions'
import { getRenderStats } from './influence/renderStats';

function fmt(n: number) {
  return (Math.round(n * 1000) / 1000).toFixed(3)
}

export default function Hud() {
  const [show, setShow] = useState(() => getDevOptions().showHud)
  useEffect(() => subscribeDevOptions(() => setShow(getDevOptions().showHud)), [])
  if (!show) return null

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 100)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') toggleQualityMode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const s = getAvatarState()
  const media = getMediaSensorsStatus()
  const m = getMediaSensorsMetrics()
  const rs = getRenderStats();

  return (
    <div
      style={{
        position: 'fixed',
        top: 14,
        left: 14,
        zIndex: 9998,
        width: 'min(20vw, 360px)',
        minWidth: 220,
        maxWidth: 420,
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
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>SCING AVATAR-LIVE HUD</div>
      <div>tick: {tick}</div>
      <div>quality(Q): {getQualityMode() ? 'QHD+ (2048)' : 'FAST (1024)'}</div>
      <div style={{ opacity: 0.85, fontSize: 12 }}>
        render: {rs.calls} calls · {rs.triangles} tris
      </div>
      <div>arousal: {fmt(s.arousal)}</div>
      <div>focus: {fmt(s.focus)}</div>
      <div>cognitiveLoad: {fmt(s.cognitiveLoad)}</div>
      <div>rhythm: {fmt(s.rhythm)}</div>
      <div>valence: {fmt(s.valence)}</div>
      <div>entropy(target): {fmt(s.entropy)}</div>

      <div style={{ marginTop: 8, fontWeight: 700 }}>MEDIA SENSORS</div>
      <div>running: {String(media.running)}</div>
      <div>audioState: {media.audioState ?? 'n/a'}</div>
      <div>error: {media.error ? media.error.slice(0, 64) : 'none'}</div>
      <div>micEnergy: {m ? fmt(m.micEnergy) : 'n/a'}</div>
      <div>pitchHz: {m ? fmt(m.pitchHz) : 'n/a'} (clarity {m ? fmt(m.pitchClarity) : 'n/a'})</div>
      <div>camLoad: {m ? fmt(m.cameraMotionNorm) : 'n/a'}</div>
      <div style={{ marginTop: 6, opacity: 0.85 }}>
        If these numbers change every second, your pipeline is live.
      </div>
    </div>
  )
}
