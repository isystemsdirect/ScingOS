import { useEffect, useState } from 'react'
import { getDevOptions, setDevOptions, subscribeDevOptions, type DevOptions } from './devOptionsStore'

function Row(props: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12, opacity: 0.92 }}>{props.label}</span>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
      />
    </label>
  )
}

function SliderRow(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  disabled: boolean
  onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 6, opacity: props.disabled ? 0.55 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12, opacity: 0.92 }}>{props.label}</span>
        <span style={{ fontSize: 12, opacity: 0.75 }}>{props.value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      />
    </div>
  )
}

export default function DevOptionsPanel() {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  if (!opt.devPanelVisible) return null

  const width = 'min(20vw, 320px)'

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        width,
        maxHeight: 'calc(100vh - 24px)',
        overflow: 'auto',
        zIndex: 40,
        pointerEvents: 'auto',
        background: 'rgba(8, 6, 14, 0.72)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        padding: 12,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3, marginBottom: 10 }}>
        SCING AVATAR ENVIRONMENT DEV OPTIONS
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <Row
          label="SCING AVATAR-LIVE HUD"
          checked={opt.hudVisible}
          onChange={(v) => setDevOptions({ hudVisible: v })}
        />
        <Row
          label="Avatar Visible"
          checked={opt.avatarVisible}
          onChange={(v) => setDevOptions({ avatarVisible: v })}
        />
        <Row
          label="Mesh Visible"
          checked={opt.meshVisible}
          onChange={(v) => setDevOptions({ meshVisible: v })}
        />
        <Row
          label="Starfield Visible"
          checked={opt.starfieldVisible}
          onChange={(v) => setDevOptions({ starfieldVisible: v })}
        />
        <Row
          label="Mic Input"
          checked={opt.micEnabled}
          onChange={(v) => setDevOptions({ micEnabled: v })}
        />
        <Row
          label="Camera Input"
          checked={opt.cameraEnabled}
          onChange={(v) => setDevOptions({ cameraEnabled: v })}
        />

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

        <Row
          label="Floor Reflection Enabled"
          checked={opt.floorReflectionEnabled}
          onChange={(v) => setDevOptions({ floorReflectionEnabled: v })}
        />

        <SliderRow
          label="Floor Reflection Strength"
          value={opt.floorReflectionStrength}
          min={0}
          max={0.8}
          step={0.01}
          disabled={false}
          onChange={(v) => setDevOptions({ floorReflectionStrength: v })}
        />
        <SliderRow
          label="Floor Reflection Blur"
          value={opt.floorReflectionBlur}
          min={0}
          max={1}
          step={0.01}
          disabled={false}
          onChange={(v) => setDevOptions({ floorReflectionBlur: v })}
        />

        <SliderRow
          label="Floor Reflection Height"
          value={opt.floorReflectionHeight}
          min={0}
          max={1}
          step={0.01}
          disabled={false}
          onChange={(v) => setDevOptions({ floorReflectionHeight: v })}
        />

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

        <Row label="Light Rig" checked={opt.lightRigEnabled} onChange={(v) => setDevOptions({ lightRigEnabled: v })} />
        <SliderRow
          label="Light Rig Intensity"
          value={opt.lightRigIntensity}
          min={0.25}
          max={1.75}
          step={0.01}
          disabled={!opt.lightRigEnabled}
          onChange={(v) => setDevOptions({ lightRigIntensity: v })}
        />
        <SliderRow
          label="Chroma Intensity"
          value={opt.chromaIntensity}
          min={0}
          max={1}
          step={0.01}
          disabled={true}
          onChange={(v) => setDevOptions({ chromaIntensity: v })}
        />
      </div>
    </div>
  )
}
