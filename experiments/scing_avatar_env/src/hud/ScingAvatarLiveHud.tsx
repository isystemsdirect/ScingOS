import { useEffect, useState } from 'react'
import { getDevOptions, subscribeDevOptions } from '../dev/devOptionsStore'

export default function ScingAvatarLiveHud() {
  const [opt, setOpt] = useState(() => getDevOptions())

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  if (!opt.hudVisible) return null

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
      <div>AVATAR: {opt.avatarVisible ? 'ON' : 'OFF'}</div>
      <div>MIC: {opt.micEnabled ? 'ON' : 'OFF'}</div>
      <div>CAM: {opt.cameraEnabled ? 'ON' : 'OFF'}</div>
    </div>
  )
}
