import { useEffect, useState } from 'react'
import { getAvatarState } from '../influence/InfluenceBridge'
import { getMediaSensorsMetrics, getMediaSensorsStatus } from '../sensors/mediaSensors'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import { getRenderStats } from '../influence/renderStats'

function fmt(n: number) {
  return (Math.round(n * 1000) / 1000).toFixed(3)
}

export default function HudCard(props: { mode?: 'fixed' | 'stack' }) {
  const opt = useDevOptionsStore()
  if (!opt.showHud) return null

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 100)
    return () => window.clearInterval(id)
  }, [])

  const s = getAvatarState()
  const media = getMediaSensorsStatus()
  const m = getMediaSensorsMetrics()
  const rs = getRenderStats()

  const avatarDrawLine = rs.failsafeOn
    ? rs.failsafeForced
      ? 'FAILSAFE ON (FORCED)'
      : 'FAILSAFE ON'
    : 'OK'

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        width: 'min(360px, 20vw)',
        zIndex: 9998,
        opacity: 0.92,
        maxHeight: 'calc(100vh - 24px)',
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
      <div style={{ marginBottom: 10, fontSize: 12, letterSpacing: 0.6, opacity: 0.9 }}>SCING AVATAR-LIVE HUD</div>

      <div style={{ display: 'grid', gap: 4 }}>
        <div>BOOT: OK</div>
          <div>AVATAR DRAW: {avatarDrawLine}</div>
        <div>MIC: {opt.enableMic ? 'ON' : 'OFF'}</div>
        <div>CAM: {opt.enableCamera ? 'ON' : 'OFF'}</div>
        <div>STARFIELD: {opt.showStarfield ? 'ON' : 'OFF'}</div>
        <div>REFLECTION: {opt.reflectionEnabled ? 'ON' : 'OFF'}</div>
        <div>tick: {tick}</div>
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
        <div style={{ marginTop: 6, opacity: 0.85 }}>If these numbers change every second, your pipeline is live.</div>
      </div>
    </div>
  )
}
