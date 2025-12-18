import { useEffect, useState } from 'react'
import DevCard from '../dev/DevCard'
import { getAvatarState } from '../influence/InfluenceBridge'
import { getMediaSensorsMetrics, getMediaSensorsStatus } from '../sensors/mediaSensors'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'

function fmt(n: number) {
  return (Math.round(n * 1000) / 1000).toFixed(3)
}

export default function HudCard() {
  const opt = useDevOptionsStore()
  if (!opt.hudVisible) return null

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 100)
    return () => window.clearInterval(id)
  }, [])

  const s = getAvatarState()
  const media = getMediaSensorsStatus()
  const m = getMediaSensorsMetrics()

  return (
    <DevCard title="SCING AVATAR-LIVE HUD" side="right" top={14 + 520}>
      <div style={{ display: 'grid', gap: 4 }}>
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
    </DevCard>
  )
}
