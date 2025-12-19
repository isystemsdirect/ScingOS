import { useEffect, useState } from 'react'
import { getDevOptions, subscribeDevOptions } from '../dev/devOptionsStore'
import { getMediaStatus, type MediaStatus } from '../sensors/mediaSensors'
import { getRenderStats, type RenderStats } from '../influence/renderStats'

export default function ScingAvatarLiveHud() {
  const [opt, setOpt] = useState(() => getDevOptions())
  const [media, setMedia] = useState<MediaStatus>(() => getMediaStatus())
  const [stats, setStats] = useState<RenderStats>(() => getRenderStats())

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setMedia(getMediaStatus())
      setStats(getRenderStats())
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  if (!opt.ui.hudVisible) return null

  const hasError = Boolean(media.error)
  const micState = !opt.sensors.mic.enabled
    ? 'OFF'
    : media.error && media.error.toUpperCase().includes('MIC')
      ? 'ERROR'
      : media.micRunning
        ? 'LIVE'
        : 'OFF'

  const camState = !opt.sensors.cam.enabled
    ? 'OFF'
    : media.error && media.error.toUpperCase().includes('CAM')
      ? 'ERROR'
      : media.camRunning
        ? 'LIVE'
        : 'OFF'

  const audioState = media.audioState || 'unknown'
  const needsClick = opt.sensors.mic.enabled && audioState !== 'running'

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        width: 'min(20vw, 320px)',
        zIndex: 50,
        pointerEvents: 'none',
        background: 'rgba(8, 6, 14, 0.72)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        padding: 12,
        backdropFilter: 'blur(10px)',
        color: 'rgba(255,255,255,0.92)',
        fontSize: 12,
        lineHeight: 1.35,
      }}
    >
      <div style={{ fontWeight: 700, letterSpacing: 0.3, marginBottom: 8 }}>SCING AVATAR-LIVE HUD</div>
      <div>BOOT: OK</div>
      <div>AVATAR: {opt.avatar.enabled ? 'ON' : 'OFF'}</div>

      <div>MIC: {micState}</div>
      <div>CAM: {camState}</div>

      <div>Audio: {audioState}</div>
      {needsClick ? <div style={{ color: 'rgba(255,220,140,0.95)' }}>CLICK CANVAS ONCE</div> : null}

      <div>micRms: {media.micRms.toFixed(3)}</div>
      <div>pitchHz: {Math.round(media.pitchHz || 0)}</div>
      <div>clarity: {media.pitchClarity.toFixed(2)}</div>
      <div>camMotion: {media.camMotion.toFixed(2)}</div>

      <div>
        FLOOR:{' '}
        {Number.isFinite(stats.floorStrength) ? stats.floorStrength.toFixed(3) : '—'}
      </div>

      {hasError ? <div style={{ marginTop: 8, color: 'rgba(255,110,110,0.95)' }}>{media.error}</div> : null}
    </div>
  )
}
